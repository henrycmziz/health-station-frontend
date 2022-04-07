<template>
  <el-row class="row">
    <el-col class="main-answer-list" :sm="24" :md="{span:18,offset:3}" :lg="{span:16,offset:4}"
            :xl="{span:14,offset:5}">
      <el-card shadow="always" class="outline-box-card">
        <div v-if="questionnaire.isBoxSelected===false">
          <h1>{{ questionnaire.questionnaireTitle }}</h1>
          <h3>{{ questionnaire.questionnaireDescription }}</h3>
        </div>
      </el-card>
      <el-form :disabled="cannotSubmit">
        <el-card v-for="(item,index) in questionList" :key="index" v-if="ifShowByCheckingFront(index)"
                 class="box-card" shadow="hover">
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
                      v-model="answerList[index].answerText"
            ></el-input>

            <el-input v-else-if="item.questionType==='multi_line_text'"
                      type="textarea" style="max-width: 80%"
                      placeholder="请输入内容（多行文本）"
                      v-model="answerList[index].answerText"
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
                     v-model="answerList[index].answerGrade"
            ></el-rate>

            <el-date-picker v-else-if="item.questionType==='date'"
                            v-model="answerList[index].answerDate" value-format="yyyy-MM-dd"
            ></el-date-picker>

            <div v-else-if="item.questionType==='text_description'" class="description-div">
              {{ item.details.textDescriptionValue }}
            </div>

          </el-form-item>
        </el-card>

        <el-form-item>
          <el-card class="box-card" style="width: 100%">

            <!--            <div style="text-align: right; margin: 0">-->
            <!--              <el-button size="mini" type="text" @click="submitVisible = false">取消</el-button>-->
            <!--              <el-button @click="submitAnswer" type="primary" size="mini">确定</el-button>-->
            <!--            </div>-->
            <el-button type="primary" @click="submitAnswer">提 交</el-button>


            <!--            <div style="text-align: right; margin: 0">-->
            <!--              <el-button size="mini" type="text" @click="resetVisible = false">取消</el-button>-->
            <!--              <el-button type="primary" size="mini" @click="resetAnswer">确定</el-button>-->
            <!--            </div>-->
            <el-button @click="resetAnswer">重 置</el-button>

            <!--            <el-popover-->
            <!--              placement="top"-->
            <!--              width="160"-->
            <!--              v-model="submitVisible">-->
            <!--              <p>确认提交？</p>-->
            <!--              <div style="text-align: right; margin: 0">-->
            <!--                <el-button size="mini" type="text" @click="submitVisible = false">取消</el-button>-->
            <!--                <el-button @click="submitAnswer" type="primary" size="mini">确定</el-button>-->
            <!--              </div>-->
            <!--              <el-button slot="reference" type="primary">提 交</el-button>-->
            <!--            </el-popover>-->

            <!--            <el-popover-->
            <!--              placement="top"-->
            <!--              width="160"-->
            <!--              v-model="resetVisible" style="margin-left: 20px">-->
            <!--              <p>确认重置？</p>-->
            <!--              <div style="text-align: right; margin: 0">-->
            <!--                <el-button size="mini" type="text" @click="resetVisible = false">取消</el-button>-->
            <!--                <el-button type="primary" size="mini" @click="resetAnswer">确定</el-button>-->
            <!--              </div>-->
            <!--              <el-button slot="reference">重 置</el-button>-->
            <!--            </el-popover>-->
          </el-card>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import {listQuestion} from "@/api/questionnaire/question";
import {getQuestionnaire} from "@/api/questionnaire/questionnaire";
import {submitAnswer} from "@/api/questionnaire/answer";

export default {
  name: "FillIn",
  data() {
    return {
      questionList: [],
      answerList: [],
      questionnaire: {
        isBoxSelected: false,
        questionnaireDescription: "Description",
        questionnaireTitle: "Title",
        questionnaireId: this.$route.params.id,
      },
      submitVisible: false,
      resetVisible: false,
      alreadySubmit: null,
      cannotSubmit: null,
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      getQuestionnaire(this.questionnaire.questionnaireId).then((res) => {
        const temp = {
          isBoxSelected: false,
          questionnaireDescription: res.data['description'],
          questionnaireTitle: res.data['title'],
          questionnaireId: res.data['questionnaireId'],
        };
        if (res.data['status'] === 'CLOSED') {
          this.$modal.msgError("问卷已关闭:(");
          this.cannotSubmit = true;
        }
        this.questionnaire = temp;
      }).catch(() => {
        this.$modal.msgError("问卷概况读取失败:(")
      })

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
            questionnaireId: t['questionnaireId'],
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
    },
    submitAnswer() {
      if (this.checkValidate()) {
        this.$modal.confirm('确认提交?').then(() => {
          return submitAnswer({
            questionnaireId: this.questionnaire.questionnaireId,
            answerList: this.answerList
          });
        }).then(() => {
          this.submitVisible = false;
          this.alreadySubmit = true;
          this.cannotSubmit = true;
          this.$modal.msgSuccess("问卷已提交:)");
        }).catch(function () {
          this.$modal.msgError("提交失败:(")
        });
      }
    },
    resetAnswer() {
      this.$modal.confirm('作答未被保存, 确认重置?').then(() => {
        this.fetchData();
        this.resetVisible = false;
      });
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
    },
    checkValidate() {
      for (const oneAnswer of this.answerList) {
        if (oneAnswer.questionNullable !== true) {
          if (oneAnswer.questionType === 'single_check' && oneAnswer.answerSingleCheck === '' ||
            oneAnswer.questionType === 'multi_check' && oneAnswer.answerMultiCheck === [] ||
            oneAnswer.questionType === 'single_line_text' && oneAnswer.answerText === '' ||
            oneAnswer.questionType === 'multi_line_text' && oneAnswer.answerText === '' ||
            oneAnswer.questionType === 'number' && oneAnswer.answerNumber == null ||
            oneAnswer.questionType === 'grade' && oneAnswer.answerGrade === 0 ||
            oneAnswer.questionType === 'date' && oneAnswer.answerDate == null) {
            this.$modal.msgError(oneAnswer.questionId % 1000 + 1 + ' ' + oneAnswer.questionTitle + ' 是必填字段:(');
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
  max-width: 800px;
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
