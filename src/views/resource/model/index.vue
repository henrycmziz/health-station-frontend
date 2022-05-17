<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模型名称" prop="modelName">
        <el-input
          v-model="queryParams.modelName"
          placeholder="请输入模型名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.modelStatus"
          placeholder="状态"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['resource:model:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['resource:model:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['resource:model:remove']"
        >删除
        </el-button>
      </el-col>
      <!--      <el-col :span="1.5">
              <el-button
                type="warning"
                plain
                icon="el-icon-download"
                size="mini"
                @click="handleExport"
                v-hasPermi="['resource:model:export']"
              >导出</el-button>
            </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="modelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模型名称" align="center" prop="modelName"/>
      <el-table-column label="模型说明" align="center" prop="modelRemark"/>
      <!--      <el-table-column label="文章集合" align="center" prop="modelArticleIds"/>-->
      <el-table-column label="视频集合" align="center" prop="modelVideoIds">
        <template v-slot="scope">
          <el-button icon="el-icon-video-camera" size="mini"
                     @click.native="openVideosDrawer(scope.row.id,scope.row.modelVideoIds)"></el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="modelStatus">
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.modelStatus"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['resource:model:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['resource:model:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改患者康复模型对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="form.modelName" placeholder="请输入模型名称"/>
        </el-form-item>
        <el-form-item label="模型说明" prop="modelRemark">
          <el-input v-model="form.modelRemark" placeholder="请输入模型说明"/>
        </el-form-item>
        <!--        <el-form-item label="文章集合" prop="modelArticleIds">
                  <el-input v-model="form.modelArticleIds" placeholder="请输入模型文章id集合，eg: 1,2,3"/>
                </el-form-item>-->
        <!--        <el-form-item label="视频集合" prop="modelVideoIds">
                  <el-input v-model="form.modelVideoIds" placeholder="请输入模型包含视频id集合，eg: 1,2,3"/>
                </el-form-item>-->
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.modelStatus" size="small">
            <el-radio-button :label="1">启用</el-radio-button>
            <el-radio-button :label="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-drawer :visible.sync="showVideoDrawer" size="36%" @close="closeDrawer">
      <template v-slot:title>
        <div>
          <el-button type="primary" size="small" @click.native="openAddVideoDialog()"
                     icon="el-icon-s-management">视频管理
          </el-button>
        </div>
      </template>
      <div class="video-area">
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
              </template>
            </video-card>
          </li>
        </ul>
      </div>
    </el-drawer>

    <el-dialog title="视频选择" :visible.sync="showVideoSelectDialog" @close="closeVideoSelectDialog" width="80%">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card header="已选视频">
            <div class="video-area" style="height: 600px;width: 100%">
              <el-scrollbar style="height: 100%;">
                <ul>
                  <draggable v-model="selectedVideo" group="video" animation="300"
                             style="min-width: 586px;min-height: 586px">
                    <li v-for="item in selectedVideo" :key="item.id">
                      <VideoCard :title="item.fileName"
                                 :duration="item.videoDuration"
                                 :img="baseUrl + item.videoThumbnailUrl"
                      ></VideoCard>
                    </li>
                  </draggable>
                </ul>
              </el-scrollbar>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card header="可选视频">
            <div class="video-area" style="height: 600px;width: 100%">
              <el-scrollbar style="height: 100%;">
                <ul>
                  <draggable v-model="optionalVideo" group="video" animation="100"
                             style="min-width: 586px;min-height: 586px">
                    <li v-for="item in optionalVideo" :key="item.id">
                      <VideoCard :title="item.fileName"
                                 :duration="item.videoDuration"
                                 :img="baseUrl + item.videoThumbnailUrl"
                      ></VideoCard>
                    </li>
                  </draggable>
                </ul>
              </el-scrollbar>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!--      <el-row>
              <el-col :span="10">
                <el-card header="已选视频" style="float: left;width: 660px">
                  <div class="video-area" style="height: 600px;width: 100%">
                    <el-scrollbar style="height: 100%;overflow-x: hidden;margin-left: -40px">
                      <ul>
                        <draggable v-model="selectedVideo" group="video" animation="300"
                                   style="min-width: 586px;min-height: 586px">
                          <li v-for="item in selectedVideo" :key="item.id">
                            <VideoCard :title="item.fileName"
                                       :duration="item.videoDuration"
                                       :img="baseUrl + item.videoThumbnailUrl"
                            ></VideoCard>
                          </li>
                        </draggable>
                      </ul>
                    </el-scrollbar>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="10">
                <el-card header="可选视频" style="width: 660px;margin-left: 670px;">
                  <div class="video-area" style="height: 600px;width: 100%">
                    <el-scrollbar style="height: 100%;overflow-x: hidden;margin-left: -40px">
                      <ul>
                        <draggable v-model="optionalVideo" group="video" animation="100"
                                   style="min-width: 586px;min-height: 586px">
                          <li v-for="item in optionalVideo" :key="item.id">
                            <VideoCard :title="item.fileName"
                                       :duration="item.videoDuration"
                                       :img="baseUrl + item.videoThumbnailUrl"
                            ></VideoCard>
                          </li>
                        </draggable>
                      </ul>
                    </el-scrollbar>
                  </div>
                </el-card>
              </el-col>
            </el-row>-->

      <span slot="footer" class="dialog-footer">
        <el-button @click.native="closeVideoSelectDialog">取消</el-button>
        <el-button type="primary" @click="addVideoSubmit">确定</el-button>
      </span>
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
import {listModel, getModel, delModel, addModel, updateModel, changeModelStatus} from "@/api/business/resource/model";
import {getVideo, getVideoByIds, listVideo} from "@/api/business/resource/video";
import IconBtn from '@/components/IconBtn'
import VideoCard from "@/components/VideoCard";
import draggable from "vuedraggable";

export default {
  name: "Model",
  components: {IconBtn, VideoCard, draggable},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 患者康复模型表格数据
      modelList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态选项
      options: [{
        value: 1,
        label: '启用'
      }, {
        value: 0,
        label: '停用'
      },],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        modelName: null,
        modelStatus: null
      },
      currModelId: null,
      showVideoDrawer: false,
      videoList: [],
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
      baseUrl: process.env.VUE_APP_BASE_API,
      showVideoSelectDialog: false,
      selectedVideo: [],
      optionalVideo: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        modelName: [
          {required: true, message: "模型名称不能为空", trigger: "blur"}
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    openVideosDrawer(id, ids) {
      this.currModelId = id
      if (ids !== null && ids !== '')
        getVideoByIds(ids).then(res => {
          this.videoList = res.data
        })
      else
        this.videoList = []
      this.showVideoDrawer = true
    },
    closeDrawer() {
      this.currModelId = undefined
    },
    handlePlayVideo(id, videoUrl, fileName) {
      this.VideoName = fileName
      this.playerOptions.sources[0].src = this.baseUrl + videoUrl
      this.videoDialog = true
    },
    // 关闭弹窗结束播放视频
    stopPlaying() {
      this.$refs.videoPlayer.player.pause()
      this.videoDialog = false
    },
    openAddVideoDialog() {
      this.showVideoSelectDialog = true
      this.selectedVideo = this.videoList
      let alreadyVideoIds = this.selectedVideo.map(item => {
        return item.id
      })
      listVideo({status: 1}).then(res => {
        this.optionalVideo = res.rows.filter(item => {
          return alreadyVideoIds.indexOf(item.id) === -1
        })
      })
    },
    closeVideoSelectDialog() {
      this.selectedVideo = []
      this.showVideoSelectDialog = false
    },
    addVideoSubmit() {
      this.showVideoSelectDialog = false
      let selectedVideoIds = this.selectedVideo.map(item => {
        return item.id
      })
      updateModel({id: this.currModelId, modelVideoIds: selectedVideoIds.toString()}).then(() => {
        this.$modal.msgSuccess('更新视频集合成功')
        // this.videoList = this.selectedVideo
        this.openVideosDrawer(this.currModelId, selectedVideoIds.toString())
      })
    },
    // 模型状态修改
    handleStatusChange(row) {
      let text = row.modelStatus === 1 ? "启用" : "停用";
      this.$modal.confirm('确认要' + text + ' "' + row.modelName + '" 吗？').then(function () {
        return changeModelStatus({id: row.id, modelStatus: row.modelStatus});
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.modelStatus = row.modelStatus === 0 ? 1 : 0;
      });
    },
    /** 查询患者康复模型列表 */
    getList() {
      this.loading = true;
      listModel(this.queryParams).then(response => {
        this.modelList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        modelName: null,
        modelRemark: null,
        modelArticleIds: null,
        modelVideoIds: null,
        modelStatus: 1,
        delFlag: null,
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
      this.queryParams.modelStatus = null
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加患者康复模型";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getModel(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改患者康复模型";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateModel(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addModel(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除患者康复模型编号为"' + ids + '"的数据项？').then(function () {
        return delModel(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('resource/model/export', {
        ...this.queryParams
      }, `model_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
<style>
.video-area {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-between;
  margin-left: 1vw;
}

.video-area ul {
  display: block;
  float: left;
  width: 100%;
}

.video-area ul li {
  display: block;
  float: left;
  position: relative;
  margin: 0 0 3px;
  padding: 10px;
}

/*.el-dialog:not(.is-fullscreen) {*/
/*  margin-top: 1vh !important;*/
/*}*/

.el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
