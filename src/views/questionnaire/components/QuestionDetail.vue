<template>
  <div>
    <div class="main-question-list">
      <div style="padding: 0; display: inline;">
        <el-card style="position: relative;border-radius: 30px 30px 0 0">
          <div class="box-is-not-selected-wrapper" @click="editTitle">
            <div v-if="questionnaire.isBoxSelected===false" class="box-is-not-selected">
              <h1>{{ questionnaire.title }}</h1>
              <h3>{{ questionnaire.description }}</h3>
            </div>
            <div class="edit-icon"><em class="el-icon-edit-outline"></em></div>
          </div>

          <div v-if="questionnaire.isBoxSelected===true">
            <el-form>
              <el-form-item>
                <el-input
                  type="text" style="max-width: 50%"
                  placeholder="请输入问卷标题"
                  v-model="questionnaire.title"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-input
                  type="textarea" style="max-width: 70%"
                  placeholder="请输入问卷描述"
                  v-model="questionnaire.description"
                ></el-input>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveQuestionnaireTitle">暂存</el-button>
                <el-button @click="questionnaire.isBoxSelected=false">收起</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>

      <div style="height: 10px"></div>

      <Question v-for="(item,index) in questionList"
                v-bind:key="item.nanoid"
                :nanoid="item.nanoid"
                :is-box-selected="item.isBoxSelected"
                :question-id="item.questionId"
                :questionnaire-id="item.questionnaireId"
                :question-index="index"
                :question-title="item.questionTitle"
                :question-description="item.questionDescription"
                :question-type="item.questionType"
                :question-nullable="item.questionNullable"
                :question-options="item.details.questionOptions"
                :front-choose="item.details.frontChoose"
                :front-options-init-value="item.details.frontOptions"
                :front-options="frontOptions(index)"
                :date="item.details.date"
                :default-number="item.details.defaultNumber"
                :grade-max="item.details.gradeMax"
                :number-type="item.details.numberType"
                :text-description="item.details.textDescription"
                @clickUnSelected="selectOneBox(index)"
                @clickSelected="selectOneBox(index)"
                @saveOneQuestion="saveOneQuestion"
                @resetQuestion="resetQuestion(index)"
                @clickDelete="deleteOneBox(index)"
      ></Question>

      <el-card class="add-question" :body-style="{ padding: '10px' }" shadow="hover">
        <div class="add-question-inner" @click="addNewQuestion('not_selected')"><em class="el-icon-plus"></em>
          添加问题
        </div>
      </el-card>

      <div style="height: 10px"></div>

      <el-card style="border-radius: 0 0 30px 30px">
        <el-button type="danger" @click="deleteQuestionnaire" style="margin-right: 36px">删 除</el-button>
        <el-button @click="saveQuestionnaire">保 存</el-button>
      </el-card>
    </div>
  </div>
</template>

<script>
import Question from "./Question";
import Clipboard from 'clipboard';
import {delQuestion, listQuestion} from "@/api/questionnaire/question";
import {delQuestionnaire, getQuestionnaire, saveQuestionnaire} from "@/api/questionnaire/questionnaire";
import {nanoid} from 'nanoid'

export default {
  name: "MainQuestionList",
  components: {Question},
  data: function () {
    return {
      questionList: [],
      questionnaire: {
        isBoxSelected: false,
        title: "请输入标题",
        description: "请输入描述",
        questionnaireId: this.$route.params.id,
      },
      deleted: false,
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      listQuestion(this.questionnaire.questionnaireId).then((res) => {
        const tempList = res.data;
        const resList = [];
        for (const t of tempList) {
          t.isBoxSelected = false;
          t.nanoid = nanoid();
          t.details.date = new Date(t.details.date)
          resList.push(t);
        }
        this.questionList = resList;
        this.$modal.msgSuccess("问卷已读取");
      }).catch(() => {
        this.$modal.msgError("问卷读取失败")
      });
      getQuestionnaire(this.questionnaire.questionnaireId).then((res) => {
        this.questionnaire = {
          isBoxSelected: false,
          description: res.data['description'],
          title: res.data['title'],
          questionnaireId: res.data['questionnaireId'],
        };
      }).catch(() => {
        this.$modal.msgError("问卷概况读取失败")
      })
    },
    selectOneBox(index) {
      this.questionList[index].isBoxSelected = !this.questionList[index].isBoxSelected;
    },
    resetQuestion(index) {
      // process in the question.vue
    },
    arrayHasNull(array) {
      let flag = false
      const iterator = array.values();
      for (const value of iterator)
        if (value === '')
          flag = true
      return flag;
    },
    saveOneQuestion(data, callback) {
      if (!data['questionTitle']) {
        this.$modal.msgWarning("题目不能为空哈");
      } else if (data['questionType'] === 'not_selected') {
        this.$modal.msgWarning("请选择题目类型");
      } else if ((data['questionType'] === 'single_check' || data['questionType'] === 'multi_check')
        && this.arrayHasNull(data['details']['questionOptions'])) {
        this.$modal.msgWarning("选项内容不可为空哈");
      } else {
        const oneQuestion = data;
        oneQuestion.isBoxSelected = true;
        this.questionList.splice(data['questionIndex'], 1, oneQuestion);
        // oneQuestion.questionnaireId = this.questionnaire.questionnaireId;
        callback(true);
        // addOneQuestion(oneQuestion).then(() => {
        //   this.$modal.msgSuccess("问题已保存")
        //   callback(true);
        // }).catch(() => {
        //   this.$modal.msgError("问题未保存")
        // });
      }
    },
    deleteOneBox(index) {
      const questionnaireId = this.questionList[index].questionnaireId;
      const questionId = this.questionList[index].questionId;
      if (questionId) {
        this.$modal.confirm('是否确认删除编号为 "' + (this.questionList[index].questionIndex + 1) + '" 的问题？此操作不可逆哈').then(function () {
          delQuestion(questionnaireId, questionId).then(() => {
            this.$modal.msgSuccess("删除成功")
            this.updateQuestionList(index)
          }).catch(() => {
            this.$modal.msgError("似乎删除失败，请稍后再试")
          });
        });
      } else {
        this.updateQuestionList(index)
      }
    },
    updateQuestionList(index) {
      this.questionList.splice(index, 1);
      // 更新问题索引
      this.questionList.forEach((item, i) => {
        item.questionIndex = i
      })
    },
    addNewQuestion(type) {
      const newQuestion = {
        nanoid: nanoid(),
        isBoxSelected: true,
        questionId: null,
        questionnaireId: this.questionnaire.questionnaireId,
        questionIndex: this.questionList.length,
        questionTitle: "",
        questionDescription: "",
        questionType: type,
        questionNullable: false,
        details: {
          questionOptions: [''],
          frontOptions: [[]],
          frontChoose: false,
          numberType: 'integer',
          defaultNumber: 0,
          gradeMax: 5,
          date: new Date(),
          textDescription: ''
        }
      };
      this.questionList.push(newQuestion);
    },
    saveQuestionnaireTitle() {
      this.questionnaire.isBoxSelected = false;
      // updateQuestionnaire(this.questionnaire).then(() => {
      //   this.$modal.msgSuccess("问卷已保存");
      // }).catch(() => {
      //   this.$modal.msgError("error！问卷未保存！");
      // });
    },
    resetQuestionnaireTitle() {
      this.questionnaire = {
        isBoxSelected: false,
        description: "请输入描述",
        title: "请输入标题",
        questionnaireId: this.$route.params.id,
      };
    },
    editTitle() {
      this.questionnaire.isBoxSelected = true;
    },
    saveQuestionnaire() {
      saveQuestionnaire({
        questionnaire: this.questionnaire,
        questionList: this.questionList,
      }).then(() => {
        this.$modal.msgSuccess("问卷已保存");
        this.$tab.closeOpenPage({path: "/questionnaire/collection"});
      }).catch(() => {
        this.$modal.msgError("问卷未保存！");
      });
    },
    deleteQuestionnaire() {
      const questionnaireId = this.questionnaire.questionnaireId;
      this.$modal.confirm('确认要删除问卷 "' + this.questionnaire.title + '" ？此操作不可逆哈').then(function () {
        return delQuestionnaire(questionnaireId);
      }).then(() => {
        this.deleted = true;
        this.$modal.msgSuccess("问卷已删除");
        this.$tab.closeOpenPage({path: "/questionnaire/collection"});
      })
    },
    frontOptions: function (index) {
      const res = [];
      for (let i = 0; i < index; i++) {
        const temp = this.questionList[i];
        if (temp != null) {
          const oneQuestion = {
            label: temp['questionTitle'],
            value: index,
            children: temp['details']['questionOptions'].map((item) => {
              return {value: item, label: item}
            })
          }
          res.push(oneQuestion);
        }
      }
      return res;
    },
    copy() {
      const clipboard = new Clipboard('.copy-link')
      clipboard.on('success', e => {
        this.$modal.msgSuccess("复制成功")
        // 释放内存
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        // 不支持复制
        // 释放内存
        clipboard.destroy()
      })
    }
  }
}
</script>

<style scoped>
.main-question-list {
  height: 100%;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 30px;
}

.add-question-inner {
  width: 50%;
  height: 78px;
  padding-top: 26px;
  /*padding-top: 25px;*/
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  border-color: rgba(128, 128, 128, 0.5);
  color: rgba(128, 128, 128, 0.5);
  border-width: 2px;
  border-style: dashed;
  font-weight: bolder;
  cursor: pointer;
}

.box-is-not-selected {
  position: relative;
}

.box-is-not-selected-wrapper {
  cursor: pointer;
}

.box-is-not-selected-wrapper:hover .box-is-not-selected {
  filter: blur(8px);
}

.edit-icon {
  display: none;
}

.box-is-not-selected-wrapper:hover .edit-icon {
  display: inline;
  height: 100%;
  width: 100%;
  background-color: rgba(179, 229, 252, 0.3);
  position: absolute;
  top: 0;
  left: 0;
}

.el-icon-edit-outline {
  position: absolute;
  top: calc(50% - 30px);
  left: calc(50% - 30px);
  font-size: 60px;
  color: rgba(128, 0, 128, 0.6);
}

</style>
