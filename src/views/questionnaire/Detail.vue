<template>
  <div class="app-container">
    <div class="create-page">
      <el-row class="create-page-main-row">
        <el-col :sm="8" :md="6" :lg="4" :xl="4" class="create-page-select-bar-wrapper hidden-xs-only">
          <div class="placeholder"></div>
          <select-bar class="create-page-select-bar"
                      @addNewQuestion="addNewQuestion"
          ></select-bar>
        </el-col>
        <el-col :sm="15" :md="16" :lg="19" :xl="19" class="create-page-question-list">
          <question-detail ref="mainQuestionList"></question-detail>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import SelectBar from "./components/SelectBar";
import QuestionDetail from "./components/QuestionDetail";
import 'element-ui/lib/theme-chalk/display.css';

export default {
  name: "Detail",
  components: {QuestionDetail, SelectBar},
  methods: {
    addNewQuestion(type) {
      this.$refs.mainQuestionList.addNewQuestion(type);
    }
  },
}
</script>

<style scoped>
.create-page {
  text-align: center;
  height: 100%
}

.create-page-main-row {
  height: 100%;
}

.create-page-question-list {
  height: 100%;
  border-radius: 6px;
  margin-left: 20px;
}

.create-page-select-bar {
  position: fixed;
}

.placeholder {
  min-width: 250px;
  min-height: 1px;
}

</style>
