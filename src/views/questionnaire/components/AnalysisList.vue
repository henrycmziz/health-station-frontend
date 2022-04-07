<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="7" :xs="24" class="descriptions">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="问卷描述">{{ questionnaire.description }}</el-descriptions-item>
          <el-descriptions-item label="问卷状态">
            <el-tag
              :type="questionnaire.status==='COLLECTING'?'success':questionnaire.status==='EDITING'?'primary':'warning'">
              <em
                :class="questionnaire.status==='COLLECTING'?'el-icon-loading':questionnaire.status==='EDITING'?'el-icon-edit':'el-icon-circle-close'"/>
              {{ translateLabel[questionnaire.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="填写人数">{{ questionnaire.fillCount }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ questionnaire.startTime }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ questionnaire.endTime }}</el-descriptions-item>
        </el-descriptions>
      </el-col>
      <el-col :span="16" :xs="24" style="float: right">
        <AnalysisCard
          v-for="(item,index) in questionList"
          :key="index"
          :question-index="index+1"
          :question-id="item.questionId"
          :question-title="item.questionTitle"
          :question-type="item.questionType"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AnalysisCard from "./AnalysisCard";
import {listQuestion} from "@/api/questionnaire/question";
import {getQuestionnaire} from "@/api/questionnaire/questionnaire";

export default {
  name: "MainAnalysisList",
  components: {AnalysisCard},
  data() {
    return {
      questionnaireId: this.$route.params.id,
      questionnaire: {
        title: '',
        description: '描述',
        status: '已完成',
        createTime: null,
        endTime: null,
        fillCount: 299,
      },
      questionList: [],
      translateLabel: {
        'COLLECTING': '收集中',
        'EDITING': '编辑中',
        'CLOSED': '已关闭'
      },
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      listQuestion(this.questionnaireId).then((res) => {
        this.questionList = res.data;
        this.$modal.msgSuccess("问卷已读取");
      }).catch(() => {
        this.$modal.msgError("问卷读取失败！");
      })

      getQuestionnaire(this.questionnaireId).then((res) => {
        this.questionnaire = res.data;
      }).catch(() => {
        this.$modal.msgError("问卷概况读取失败！")
      })
    }
  }
}
</script>

<style scoped>
.descriptions {
  position: fixed;
}
</style>
