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

    <el-drawer :visible.sync="previewDrawer" :close-on-click-modal="true">
      <preview :questionnaire-id="id"/>
    </el-drawer>
  </div>
</template>

<script>
import Clipboard from "clipboard";
import Preview from "@/views/questionnaire/components/Preview";
import {parseTime} from "@/utils/ruoyi";

export default {
  name: "questionnaire-card",
  components: {Preview},
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
    copy() {
      const clipboard = new Clipboard('.copy-link')
      clipboard.on('success', e => {
        this.$message({message: "复制成功", duration: 1000})
        // 释放内存
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        // 释放内存
        clipboard.destroy()
      })
    },
  }
}
</script>

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
