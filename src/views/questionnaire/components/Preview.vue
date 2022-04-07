<template>
  <el-row class="main-answer-list">
    <el-card shadow="always" class="outline-box-card">
      <div v-if="questionnaire.isBoxSelected===false">
        <h1>{{ questionnaire.questionnaireTitle }}</h1>
        <h3>{{ questionnaire.questionnaireDescription }}</h3>
      </div>
    </el-card>

    <el-form>
      <el-card v-for="(item,index) in questionList" :key="index" class="box-card" shadow="hover"
               v-if="ifShowByCheckingFront(index)">
        <el-form-item>
          <div class="question-title-div">
            <div style="display: inline" v-if="item.questionNullable===false" class="nullable-star">
              *
            </div>
            <div style="display: inline"><b>{{ index + 1 }}. {{ item.questionTitle }}
              {{ item.questionDescription !== "" ? '(' + item.questionDescription + ')' : '' }}</b></div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-radio-group v-if="item.questionType==='single_check'"
                          v-model="answerList[index].answerSingleCheck">
            <el-radio v-for="(optionItem,optionIndex) in item.details.questionOptions" :key="optionIndex"
                      :label="optionItem">{{ optionItem }}
            </el-radio>
          </el-radio-group>

          <el-checkbox-group v-else-if="item.questionType==='multi_check'"
                             v-model="answerList[index].answerMultiCheck">
            <el-checkbox v-for="(optionItem,optionIndex) in item.details.questionOptions" :key="optionIndex"
                         :label="optionItem">{{ optionItem }}
            </el-checkbox>
          </el-checkbox-group>

          <el-input v-else-if="item.questionType==='single_line_text'"
                    type="text" style="max-width: 80%"
                    placeholder="请输入内容（单行文本）"
          ></el-input>

          <el-input v-else-if="item.questionType==='multi_line_text'"
                    type="textarea" style="max-width: 80%"
                    placeholder="请输入内容（多行文本）"
          ></el-input>

          <el-input-number v-else-if="item.questionType==='number'&&item.details.numberType==='integer'"
                           type="number" :step="1"
                           oninput="this.value = this.value.replace(/[^0-9]/g, '');"
                           v-model="answerList[index].answerNumber"
                           style="max-width: 200px" controls-position="right" placeholder="请输入整数"
          ></el-input-number>

          <el-input-number v-else-if="item.questionType==='number'&&item.details.numberType!=='integer'"
                           type="number" :step="0.1"
                           v-model="answerList[index].answerNumber"
                           style="max-width: 200px" controls-position="right" placeholder="请输入数字"
          ></el-input-number>

          <el-rate v-else-if="item.questionType==='grade'"
                   :max="item.gradeMax"
          >
          </el-rate>

          <el-date-picker v-else-if="item.questionType==='date'"
          ></el-date-picker>

          <div v-else-if="item.questionType==='text_description'" class="description-div">
            {{ item.details.textDescriptionValue }}
          </div>

        </el-form-item>
      </el-card>
    </el-form>
  </el-row>
</template>

<script>
import {listQuestion} from "@/api/questionnaire/question";
import {getQuestionnaire} from "@/api/questionnaire/questionnaire";

export default {
  name: "Preview",
  props: {
    questionnaireId: Number,
  },
  data() {
    return {
      questionList: [],
      answerList: [],
      questionnaire: {
        isBoxSelected: false,
        questionnaireDescription: "Description",
        questionnaireTitle: "Title",
        questionnaireId: this.questionnaireId,
      },
      submitVisible: false,
      resetVisible: false,
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      listQuestion(this.questionnaire.questionnaireId).then((res) => {
        const tempList = res.data;
        const resList = [];
        const ansList = [];
        for (const t of tempList) {
          resList.push(t);
          const oneAnswer = {
            questionId: t['questionId'],
            questionTitle: t['questionTitle'],
            questionType: t['questionType'],
            questionNullable: t['questionNullable'],
            answerSingleCheck: '',
            answerMultiCheck: [],
            answerText: '',
            answerNumber: t['details']['defaultNumber'],
            answerGrade: 0,
            answerDate: t['date'],
          };
          ansList.push(oneAnswer);
        }
        this.questionList = resList;
        this.answerList = ansList;
        this.$modal.msgSuccess("问卷已读取:)");
      }).catch(() => {
        this.$modal.msgError("问卷读取失败:(");
      })

      getQuestionnaire(this.questionnaire.questionnaireId).then((res) => {
        this.questionnaire = {
          isBoxSelected: false,
          questionnaireDescription: res.data['description'],
          questionnaireTitle: res.data['title'],
          questionnaireId: res.data['questionnaireId'],
        };
      }).catch(() => {
        this.$modal.msgError("问卷概况读取失败:(")
      })
    },
    ifShowByCheckingFront(index) {
      const thisQuestion = this.questionList[index];
      if (thisQuestion.details.frontChoose === false)
        return true;
      for (const oneFront of thisQuestion.details.frontOptions) {
        const frontIndex = oneFront[0] - 1;
        const frontValue = oneFront[1];
        const frontQuestion = this.questionList[frontIndex];
        let checkList = null;
        if (frontQuestion.questionType === 'single_check') {
          checkList = this.answerList[frontIndex].answerSingleCheck;
          if (frontValue !== checkList) return false;
        } else if (frontQuestion.questionType === 'multi_check') {
          checkList = this.answerList[frontIndex].answerMultiCheck;
          for (const oneOfMulti of frontValue) {
            if (checkList.indexOf(oneOfMulti) === -1)
              return false;
          }
        }
      }
      return true;
    }
  }
}
</script>

<style lang="scss" scoped>
.main-answer-list {
  //position: relative;
  //text-align: left;
  //box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
}

.outline-box-card {
  text-align: center;
  border-radius: 30px 30px 0 0;
}

.box-card {
  padding-left: 5%;

  &:last-child {
    border-radius: 0 0 30px 30px;
  }
}

.nullable-star {
  color: red;
}

</style>
