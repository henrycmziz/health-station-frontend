<template>
  <div>
    <el-card shadow="hover" @click.native="dialogOutlineDataVisible = true">
      <div class="card-inner">
        <div class="card-title">
          {{ title }}
        </div>
        <div class="card-state">
          <el-tag :type="status==='COLLECTING'?'success':status==='EDITING'?'primary':'warning'">
            <em
              :class="status==='COLLECTING'?'el-icon-loading':status==='EDITING'?'el-icon-edit':'el-icon-circle-close'"/>
            {{ translateLabel[status] }}
          </el-tag>
        </div>
        <div class="card-time">
          {{ createTime }}
        </div>
      </div>
    </el-card>
    <el-dialog :title="title" :visible.sync="dialogOutlineDataVisible" append-to-body center>
      <el-descriptions class="margin-top" :column="1" border>
        <el-descriptions-item label="问卷描述">{{ description }}</el-descriptions-item>
        <el-descriptions-item label="问卷链接" v-if="status==='COLLECTING'">
          <el-link class="copy-link" icon="el-icon-link" :underline="false"
                   target="_blank" @click="copy"
                   :data-clipboard-text="genLink(this.id)"
                   data-clipboard-action="copy"
                   type="primary"
          >
            点击复制链接
          </el-link>
          <span style="margin-left: 20px;cursor: pointer" @click="showQRCode()">
                  <em class="el-icon-view"></em>查看二维码
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="问卷状态">
          <el-tag :type="status==='COLLECTING'?'success':status==='EDITING'?'primary':'warning'">
            <em
              :class="status==='COLLECTING'?'el-icon-loading':status==='EDITING'?'el-icon-edit':'el-icon-circle-close'"/>
            {{ translateLabel[status] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="填写人数">{{ fillCount }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ startTime }}</el-descriptions-item>
        <el-descriptions-item label="截止时间">{{ endTime }}</el-descriptions-item>
      </el-descriptions>

      <span slot="footer">
        <el-button type="danger" @click="deleteQuestionnaire" icon="el-icon-delete">删 除</el-button>
        <el-button v-if="status==='COLLECTING'" @click="closeQuestionnaire" icon="el-icon-close">关 停</el-button>
        <el-button v-if="status==='CLOSED'" @click="releaseQuestionnaire" icon="el-icon-s-release">重 新 开 放</el-button>
        <el-button @click="gotoPreview" icon="el-icon-search">预 览</el-button>
        <el-button v-if="status!=='EDITING'" type="primary" @click="gotoAnalysis" icon="el-icon-s-data">分 析</el-button>
        <el-button v-if="status==='EDITING'" @click="gotoEdit" icon="el-icon-edit">编 辑</el-button>
        <el-button v-if="status==='EDITING'" type="primary" @click="releaseQuestionnaire"
                   icon="el-icon-s-release">开 放</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="'问卷 '+this.title+' 二维码'" :visible.sync="showQRCodeDialogVisible" @open="showQRCode"
      width="30%" center append-to-body>
      <div id="qrcode" ref="qrcode" class="qrcode"></div>
    </el-dialog>

    <el-drawer :visible.sync="previewDrawer" :close-on-click-modal="true">
      <preview :questionnaire-id="id"/>
    </el-drawer>
  </div>
</template>

<script>
import Clipboard from "clipboard";
import Preview from "@/views/questionnaire/components/Preview";
import QRCode from 'qrcodejs2'
import {parseTime} from "@/utils/ruoyi";

export default {
  name: "questionnaire-card",
  components: {Preview, QRCode},
  props: {
    id: Number,
    title: String,
    status: String,
    description: String,
    startTime: String,
    endTime: String,
    fillCount: Number,
    createTime: String
  },
  data() {
    return {
      dialogOutlineDataVisible: false,
      showQRCodeDialogVisible: false,
      previewDrawer: false,
      translateLabel: {
        'COLLECTING': '收集中',
        'EDITING': '编辑中',
        'CLOSED': '已关闭'
      },
    }
  },
  methods: {
    deleteQuestionnaire() {
      this.$emit("deleteQuestionnaire", this.id, this.title);
    },
    closeQuestionnaire() {
      this.$emit("closeQuestionnaire", {
        questionnaireId: this.id,
        status: 'CLOSED',
        endTime: parseTime(new Date())
      });
    },
    gotoPreview() {
      this.previewDrawer = true
    },
    gotoAnalysis() {
      this.$router.push('/questionnaire/analysis/' + this.id);
    },
    gotoEdit() {
      this.dialogOutlineDataVisible = false
      this.$router.push('/questionnaire/detail/' + this.id);
    },
    releaseQuestionnaire() {
      this.$emit("releaseQuestionnaire", {
        questionnaireId: this.id,
        status: 'COLLECTING',
        startTime: parseTime(new Date()),
        endTime: ''
      });
    },
    getLocalhostPath() {
      // 获取当前页面地址，如http://localhost:8080/admin/index
      let wPath = window.document.location.href;
      // 获取当前页面主机地址之后的目录，如：/admin/index
      let pathName = this.$route.path;
      let pos = wPath.indexOf(pathName);
      // 获取主机地址，如：http://localhost:8080
      return wPath.substring(0, pos);
    },
    genLink(id) {
      return this.getLocalhostPath() + '/questionnaire/fill-in?qid=' + id;
    },
    copy() {
      const clipboard = new Clipboard('.copy-link')
      clipboard.on('success', e => {
        this.$modal.msgSuccess("复制成功")
        // 释放内存
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        this.$modal.msgWarning("复制失败")
        // 释放内存
        clipboard.destroy()
      })
    },
    showQRCode() {
      console.log(this.genLink(this.id))
      //调用函数生成二维码
      this.$nextTick(function () {
        //二维码初始化 点击一次添加一个二维码
        this.$refs.qrcode.innerHTML = "";
        this.qrcode(124, 124, this.genLink(this.id), "canvas");
      });
      //打开遮罩
      this.showQRCodeDialogVisible = true;
    },

    /**
     * @description 生成二维码
     * @param  {number} qWidth  宽度px
     * @param  {number} qHeight  高度px
     * @param  {string} qText  二维码内容（跳转连接）
     * @param  {string} qRender 渲染方式（有两种方式 table和canvas，默认是canvas）
     */
    qrcode(qWidth, qHeight, qText, qRender) {
      let qrcode = new QRCode("qrcode", {
        width: qWidth,
        height: qHeight,
        text: qText,
        render: qRender
      });
    }
  }
}
</script>
<style lang="scss">
.qrcode {
  img {
    margin: 0 auto;
  }
}
</style>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
  text-align: center;
}

.description-box {
  text-align: left;
  font-size: 14px;
  line-height: 35px;
  margin-left: 10%;
  margin-bottom: 15px;
  margin-top: 15px;
}

.el-card {
  width: 150px;
  height: 200px;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-width: 2px;
  -webkit-user-select: none;
  cursor: pointer;
  border-radius: 6px;
}

.card-inner {
  background-color: rgba(128, 128, 128, 0.1);
  width: 140px;
  height: 190px;
  position: relative;
  text-align: center;
}

.card-title {
  padding-top: 25px;
  font-size: 16px;
  font-weight: bold;
  color: black;
  overflow: hidden;
  width: 75%;
  margin: auto;
}

.card-time {
  position: absolute;
  font-size: 10px;
  color: black;
  bottom: 15px;
  width: 100%;
}

.card-state {
  position: absolute;
  font-size: 14px;
  color: black;
  bottom: 40px;
  width: 100%;
}

</style>
