<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="视频名称" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="请输入视频名称关键字"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="视频状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="视频状态"
          clearable
          size="small"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-progress
      :percentage="videoUploadPercent"
      :stroke-width="14"
      :text-inside="true"
      :color="progressColors"
      v-if="videoUploadPercent"
    />

    <div class="content">
      <ul>
        <li v-for="(item, i) in videoList" :key="i">
          <video-card :title="item.fileName"
                      :duration="item.videoDuration"
                      :img="baseUrl + item.videoThumbnailUrl">
            <!--  播放、编辑、删除按钮-->
            <template v-slot:action>
              <span @click="handlePlayVideo(item.id, item.videoUrl, item.fileName)">
                 <el-button type="success" icon="el-icon-video-play" size="mini" circle></el-button>
              </span>
              <span @click="handleUpdate(item.id)">
                               <el-button type="primary" icon="el-icon-edit" size="mini" circle></el-button>
                            </span>
              <span @click="handleDelete(item.id, item.fileName)">
                               <el-button type="danger" icon="el-icon-delete" size="mini" circle></el-button>
                            </span>
            </template>
          </video-card>
        </li>
        <li>
          <el-upload
            drag multiple
            :headers="upload.headers"
            :action="upload.url"
            :before-upload="handleBeforeUpload"
            :on-progress="handleUploadProcess"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-exceed="handleExceed"
            :limit="upload.limit"
            name="file"
            :show-file-list="false"
          >
            <em class="el-icon-upload"></em>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </li>
      </ul>
    </div>

    <pagination
      v-show="total>0"
      :total="total"
      :page-sizes="[14,28,56,112]"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改视频信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" append-to-body center>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="fileName">
          <el-input v-model="form.fileName" placeholder="请输入文件名称"/>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态" prop="videoDuration">
              <el-radio-group v-model="form.status" size="small">
                <el-radio-button label="1">正常</el-radio-button>
                <el-radio-button label="0">停用</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时长" prop="videoDuration">
              <el-input v-model="form.videoDuration" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="创建时间" prop="createTime">
              <el-input v-model="form.createTime" size="small" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间" prop="updateTime">
              <el-input v-model="form.updateTime" size="small" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="说明" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="url" prop="videoUrl">
          <el-input v-model="form.videoUrl" disabled/>
        </el-form-item>
        <el-form-item label="缩略图url" prop="videoThumbnailUrl">
          <el-input v-model="form.videoThumbnailUrl" disabled/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--   播放视频-->
    <el-dialog :title="VideoName" :visible.sync="videoDialog" @close="stopPlaying" center>
      <el-card style="margin-top: -30px;">
        <video-player ref="videoPlayer"
                      :options="playerOptions"
                      :playsinline="true"
                      class="video-player vjs-custom-skin"
        ></video-player>
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import {getToken} from "@/utils/auth";
import VideoCard from "@/components/VideoCard";
import {delVideo, getVideo, listVideo, updateVideo} from "@/api/business/resource/video";

export default {
  name: "Video",
  components: {VideoCard},
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      // 上传参数
      fileSize: 1024,
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: {Authorization: "Bearer " + getToken()},
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/resource/video/upload",
        // 上传的文件列表
        fileList: [],
        // 可接受的视频类型
        AcceptFileType: ['mp4', 'mkv'],
        // 同时上传个数限制
        limit: 5
      },
      videoUploadPercent: 0,
      progressColors: [
        {color: '#f56c6c', percentage: 30},
        {color: '#1989fa', percentage: 80},
        {color: '#5cb87a', percentage: 100}
      ],
      // 是否在播放视频
      videoDialog: false,
      VideoName: '',
      playerOptions: {
        autoplay: true,
        controls: true,//用户可以与之交互的控件
        preload: true,
        aspectRatio: '16:9',
        language: 'en',
        playbackRates: [0.5, 1.0, 1.5, 2.0],
        sources: [{
          src: ""
        }],
      },
      // 视频状态选项
      options: [{
        value: '1',
        label: '正常'
      }, {
        value: '0',
        label: '停用'
      },],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,

      // 总条数
      total: 0,
      // 视频信息列表数据
      videoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 14,
        fileName: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        fileName: [
          {required: true, message: "文件名称不能为空", trigger: "blur"}
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 关闭弹窗结束播放视频
    stopPlaying() {
      this.$refs.videoPlayer.player.pause()
      this.videoDialog = false
    },
    // 上传前文件大小和格式检测
    handleBeforeUpload(file) {
      // 校检格式
      let isVideo = false;
      if (this.upload.AcceptFileType.length) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        isVideo = this.upload.AcceptFileType.some(type => {
          if (file.type.indexOf(type) > -1) return true;
          return !!(fileExtension && fileExtension.indexOf(type) > -1);
        });
      } else {
        isVideo = file.type.indexOf("video") > -1;
      }

      if (!isVideo) {
        this.$message.error(
          `格式不正确, 请上传${this.upload.AcceptFileType.join("/")}视频格式文件!`
        );
        return false;
      }
      // 校检文件大小
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$message.error(`上传视频大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      return true;
    },
    // 上传进度
    handleUploadProcess(event, file) {
      this.videoUploadPercent = ((event.loaded / event.total) * 100) | 0;
      // this.videoUploadPercent = Number(file.percentage.toFixed(0));
    },
    // 文件个数超出
    handleExceed() {
      this.$message.error(`上传数量不能超过 ${this.limit} 个!`);
    },
    // 上传成功回调
    handleUploadSuccess(res) {
      this.$message({
        type: 'success',
        message: '上传成功',
      })
      this.videoUploadPercent = 0;
      this.getList();
    },
    // 上传失败
    handleUploadError() {
      this.$message({
        type: "error",
        message: "上传失败",
      });
      this.videoUploadPercent = 0;
    },

    handlePlayVideo(id, videoUrl, fileName) {
      this.VideoName = fileName
      this.playerOptions.sources[0].src = this.baseUrl + videoUrl
      this.videoDialog = true
    },

    /** 查询视频信息列表 */
    getList() {
      this.loading = true;
      listVideo(this.queryParams).then(response => {
        this.videoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        showOrder: null,
        videoUrl: null,
        extendType: null,
        fileName: null,
        realFileName: null,
        videoThumbnailUrl: null,
        videoDuration: null,
        remark: null,
        status: 0,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(id) {
      this.reset();
      getVideo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改视频信息";
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          updateVideo(this.form).then(response => {
            this.$modal.msgSuccess("修改成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(id, videoName) {
      this.$modal.confirm('是否确认删除视频名为"' + videoName + '"的数据项？').then(function () {
        return delVideo(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      });
    }
  }
};
</script>

<style>
.content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-between;
  margin-left: 1vw;
}

.content ul {
  display: block;
  float: left;
  width: 100%;
}

.content ul li {
  display: block;
  float: left;
  position: relative;
  margin: 0 0 3px;
  padding: 10px;
}

.el-upload-dragger {
  width: 267px !important;
  height: 150px !important;
}
</style>
