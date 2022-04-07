<template>
  <div class="app-container">
    <el-row class="row-head" type="flex" justify="start">
      <el-col>
        <TypeChooseBox @changeShow="changeShow"></TypeChooseBox>
      </el-col>
      <el-col align="end" class="hidden-xs-only">
        <el-button class="create-button"
                   @click="gotoCreate"
                   type="primary"
                   icon="el-icon-plus"
                   size="small"
        >创建问卷
        </el-button>
      </el-col>
    </el-row>

    <el-divider></el-divider>

    <div class="questionnaire-card-ground">
      <el-row :gutter="10">
        <el-col :xs="12" :sm="6" :md="6" :lg="3" :xl="3" v-for="item in questionnaireList" :key="item.questionnaireId">
          <QuestionnaireCard class="questionnaire-card" :title="item.title"
                             @deleteQuestionnaire="deleteQuestionnaire"
                             @closeQuestionnaire="closeQuestionnaire"
                             @releaseQuestionnaire="releaseQuestionnaire"
                             :id="item.questionnaireId" :status="item.status" :start-time="item.startTime"
                             :end-time="item.endTime" :create-time="item.createTime"
                             :description="item.description" :fill-count="item.fillCount"
                             v-if="checkedList.indexOf(item.status)!==-1"
          >
          </QuestionnaireCard>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import QuestionnaireCard from "../components/QuestionnaireCard";
import TypeChooseBox from "../components/TypeChooseBox";
import {
  addQuestionnaire,
  listQuestionnaire,
  delQuestionnaire,
  updateQuestionnaire
} from "@/api/questionnaire/questionnaire";

export default {
  name: "Collection",
  components: {QuestionnaireCard, TypeChooseBox},
  data() {
    return {
      questionnaireList: [],
      checkedList: ['COLLECTING', 'EDITING', 'CLOSED'],
      previewDrawer: false,
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      listQuestionnaire().then((response) => {
        this.questionnaireList = response.rows;
      }).catch(() => {
        this.$modal.msgError("问卷读取失败！");
      })
    },
    gotoCreate() {
      addQuestionnaire().then((response) => {
        this.$router.push('/questionnaire/detail/' + response.data);
      })
    },
    deleteQuestionnaire(id, title) {
      this.$modal.confirm('确认要删除问卷 "' + title + '" 吗？').then(function () {
        return delQuestionnaire(id);
      }).then(() => {
        this.dialogOutlineDataVisible = false;
        this.$modal.msgSuccess("删除问卷成功");
        this.fetchData();
      });
    },
    closeQuestionnaire(data) {
      updateQuestionnaire(data).then(() => {
        this.dialogOutlineDataVisible = false;
        this.$modal.msgSuccess('已成功关闭')
        this.fetchData();
      }).catch(() => {
        this.$modal.msgError('关闭失败')
      });
    },
    gotoPreview() {
      this.previewDrawer = true
    },
    releaseQuestionnaire(data) {
      updateQuestionnaire(data).then(() => {
        this.dialogOutlineDataVisible = false;
        this.$modal.msgSuccess('问卷已发布')
        this.fetchData();
      }).catch(() => {
        this.$modal.msgError('问卷发布失败')
      });
    },
    changeShow(data) {
      this.checkedList = data;
    }
  }
}
</script>

<style scoped>
.row-head {
  /*margin-top: 15px;*/
  margin-left: 10px;
}

.row-right {
  float: right;
}
</style>
