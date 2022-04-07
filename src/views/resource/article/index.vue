<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
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
      <el-form-item label="来源" prop="articleFrom">
        <el-select
          v-model="queryParams.articleFrom"
          placeholder="来源"
          clearable
          size="small"
        >
          <el-option
            v-for="item in articleFromOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRangeCreateTime"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
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
          v-hasPermi="['resource:article:add']"
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
          v-hasPermi="['resource:article:edit']"
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
          v-hasPermi="['resource:article:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="articleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true"/>
      <el-table-column label="来源" align="center" prop="articleFrom">
        <template slot-scope="scope">
          {{ scope.row.articleFrom === 0 ? '自建' : '网络' }}
        </template>
      </el-table-column>
      <el-table-column label="正文" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleArticleView(scope.row)"
            v-if="scope.row.articleFrom === 0"
          > 预览
          </el-button>
          <el-link icon="el-icon-link" :href="scope.row.articleUrl" target="_blank"
                   :underline="false"
                   :type="scope.row.linkType===true?'success':'warning'"
                   v-else>查看
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['resource:article:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['resource:article:remove']"
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

    <!-- 添加或修改健康小知识对话框 -->
    <el-dialog :title="title" :visible.sync="open" :before-close="handleClose" width="66%" center destroy-on-close
               append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" style="padding-right: 40px">
        <el-row>
          <el-col :span="14">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题"/>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status" size="small">
                <el-radio-button :label="1">启用</el-radio-button>
                <el-radio-button :label="0">停用</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="来源" prop="articleFrom">
              <el-radio-group v-model="form.articleFrom" size="small">
                <el-radio-button :label="0">自建</el-radio-button>
                <el-radio-button :label="1">网络</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="正文" v-if="form.articleFrom === 0" key="0">
          <we-editor
            class="we-editor"
            toolbar-class="we-editor-toolbar"
            editable-class="we-editor-editable"
            :toolbar-option="wangEditor.toolbar"
            :editable-option="wangEditor.editable"
            :html.sync="form.article"/>
        </el-form-item>
        <el-form-item label="url" prop="articleUrl" v-if="form.articleFrom === 1" key="1" required>
          <el-input v-model="form.articleUrl"/>
        </el-form-item>
        <!--        <el-form-item label="缩略图" prop="thumbnail">-->
        <!--          <el-input v-model="form.thumbnail" placeholder="请输入缩略图" />-->
        <!--        </el-form-item>-->
      </el-form>
      <span slot="footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
      </span>
    </el-dialog>

    <!--    小知识预览抽屉-->
    <el-drawer :title="viewTitle" :visible.sync="viewOpen" size="50%" destroy-on-close>
      <div class="we-editor-view">
        <we-editable
          editable-class="we-editor-view-editable"
          :option="wangEditorView.editable"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {getToken} from "@/utils/auth";
import {
  addArticle,
  changeArticleStatus,
  delArticle,
  getArticle,
  listArticle,
  updateArticle
} from "@/api/business/resource/article";
import {useWangEditor, WeEditable, WeEditor} from 'wangeditor5-for-vue2'
import '@wangeditor/editor/dist/css/style.css'
import Ping from 'ping-url'

export default {
  name: "Article",
  components: {WeEditor, WeEditable},
  data() {
    const validateBlank = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('url不能为空'));
      }
      const regex = /^[^\s]*$/g;
      if (!regex.test(value)) {
        callback(new Error('url内似乎有空格, 请检查一下哈'))
      } else {
        callback()
      }
    };
    return {
      // 插入图片url list
      imageInsertList: [],
      // 文章保存时 图片url list
      imageLastList: [],
      wangEditor: useWangEditor({
        config: {
          MENU_CONF: {
            uploadImage: {
              server: process.env.VUE_APP_BASE_API + "/resource/article/upload",
              fieldName: 'file',
              maxFileSize: 10 * 1024 * 1024,
              headers: {Authorization: "Bearer " + getToken()},
              // 自定义插入图片
              customInsert: (res, insertFn) => {
                // res 即服务端的返回结果
                const url = this.insertStr(res.data.url, res.data.url.indexOf('profile') - 1, process.env.VUE_APP_BASE_API)
                const alt = '', href = ''
                // 从 res 中找到 url alt href ，然后插入图片
                insertFn(url, alt, href)
              },
              // 单个文件上传成功之后
              onSuccess: (file, res) => {
                // console.log(`${file.name} 上传成功`, res)
              },
              // 单个文件上传失败
              onFailed: (file, res) => {
                // console.log(`${file.name} 上传失败`, res)
              },
              // 上传错误，或者触发 timeout 超时
              onError: (file, err, res) => {
                // console.log(`${file.name} 上传出错`, err, res)
              }
            },
            insertImage: {
              onInsertedImage(imageNode) {
                if (imageNode == null) return
                const {src, alt, url, href} = imageNode
                // console.log('inserted image', src, alt, url, href)
                // TODO this.imageInsertList.push(url)
              },
            }
          }
        },
        delay: 1000
      }),
      wangEditorView: useWangEditor(),
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
      // 健康小知识表格数据
      articleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 预览抽屉
      viewTitle: "",
      // 预览内容
      viewArticle: "",
      // 是否显示抽屉
      viewOpen: false,
      // 状态选项
      options: [{
        value: 1,
        label: '启用'
      }, {
        value: 0,
        label: '停用'
      },],
      // 文章来源选项
      articleFromOptions: [{
        value: 0,
        label: '自建'
      }, {
        value: 1,
        label: '网络'
      },],
      // 时间范围
      dateRangeCreateTime: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        status: null,
        createTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          {required: true, message: "标题不能为空", trigger: "blur"}
        ],
        status: [
          {required: true, message: "状态; 0:草稿, 1:正常, -1:禁用不能为空", trigger: "blur"}
        ],
        articleUrl: [{validator: validateBlank, trigger: 'blur'}]
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询健康小知识列表 */
    async getList() {
      this.loading = true;
      this.queryParams.params = {};
      if (null != this.dateRangeCreateTime && '' !== this.dateRangeCreateTime) {
        this.queryParams.params["beginCreateTime"] = this.dateRangeCreateTime[0];
        this.queryParams.params["endCreateTime"] = this.dateRangeCreateTime[1];
      }
      let resList = await listArticle(this.queryParams);
      this.articleList = resList.rows;
      this.total = resList.total;
      this.loading = false;
      // 检测url
      for (const ele of this.articleList.filter(item => {
        return item.articleUrl
      })) {
        const state = await this.urlValid((ele.articleUrl));
        this.$set(ele, 'linkType', state);
      }
    },
    // 文章状态修改
    handleStatusChange(row) {
      let text = row.status === 1 ? "启用" : "停用";
      this.$modal.confirm('确认要' + text + ' "' + row.title + '" 吗？').then(function () {
        return changeArticleStatus({id: row.id, status: row.status});
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === 0 ? 1 : 0;
      });
    },
    handleClose(done) {
      this.$modal.confirm('表单未保存，确认关闭？').then(_ => {
        done();
        this.editorReset()
      }).catch(() => {
      })
    },
    editorReset() {
      this.wangEditor.getEditable().unFullScreen()
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
      this.editorReset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        title: null,
        articleFrom: 0,
        article: '',
        articleUrl: null,
        // thumbnail: null,
        status: 1,
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
      this.dateRangeCreateTime = [];
      this.resetForm("queryForm");
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
      this.title = "添加健康小知识";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getArticle(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改健康小知识";
      });
    },
    /** 文章预览 */
    handleArticleView(row) {
      this.viewTitle = row.title
      this.wangEditorView.editable.config.readOnly = false
      this.wangEditorView.editable.defaultHtml = row.article
      this.viewOpen = true
      this.$nextTick(() => {
        this.wangEditorView.editable.config.readOnly = true
      })
    },
    /** url有效性检查 */
    async urlValid(url) {
      try {
        let res = await Ping.check(url);
        if (res.status) {
          return true
        }
      } catch (err) {
      }
      return false
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateArticle(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              // this.handleImageRemove();
              this.open = false;
              this.getList();
            });
          } else {
            addArticle(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              // this.handleImageRemove();
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** TODO 从服务器中删除文本中删除图片 */
    handleImageRemove() {
      console.log('getEditable', this.wangEditor.getEditable().getElemsByType('image'))
      this.imageLastList = this.wangEditor.getEditable().getElemsByType('image')
      console.log(this.imageLastList)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除健康小知识编号为"' + ids + '"的数据项？').then(function () {
        return delArticle(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    insertStr(source, start, insertedStr) {
      return source.slice(0, start) + insertedStr + source.slice(start);
    },
  },
  watch: {
    viewArticle: {
      handler(n, o) {
        console.log(`n: ${n}\no: ${o}`)
      }
    }
  }
};
</script>

<style lang='scss'>
.we-editor {
  border: 1px solid #e5e5e5;

  &-toolbar {
    border-bottom: 1px solid #e5e5e5;
  }

  &-editable {
    height: 500px;
  }
}

.we-editor-view {
  border: 1px solid #e5e5e5;
  margin: 10px;

  &-toolbar {
    border-bottom: 1px solid #e5e5e5;
  }

  &-editable {
    //height: 500px;
  }
}

.el-dialog:not(.is-fullscreen) {
  margin-top: 1vh !important;
}

//.we-editor-toolbar {
//  border-bottom: 1px solid #e5e5e5;
//}
//
//.we-editor-editable {
//  height: 500px;
//}

//底部按钮粘性定位在屏幕底部
//::v-deep .el-dialog {
//  .el-dialog__footer {
//    position: sticky;
//    bottom: 0;
//    //width: 100%;
//    padding: 0;
//  }
//}
//
//.footer-btn {
//  display: flex;
//  background-color: #fff;
//  justify-content: center;
//  padding: 10px 20px;
//}
</style>
