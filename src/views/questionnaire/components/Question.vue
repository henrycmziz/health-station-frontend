<template>
  <div style="position: relative;">
    <el-card class="box-card" shadow="hover">
      <div class="box-is-not-selected-wrapper" v-if="!isBoxSelected" @click="clickUnSelected">
        <div class="box-is-not-selected">
          <div class="question-title-div">
            <div style="display: inline" v-if="questionNullableValue===false" class="nullable-star"> *</div>
            <div style="display: inline">{{ questionIndex + 1 }}. {{ questionTitleValue }}
              {{ questionDescription !== "" ? '(' + questionDescription + ')' : '' }}
            </div>
          </div>

          <el-radio-group v-if="typeValue==='single_check'" v-model="optionsValue">
            <el-radio v-for="(item,index) in optionsValue" :key="index">{{ item }}</el-radio>
          </el-radio-group>

          <el-checkbox-group v-else-if="typeValue==='multi_check'" v-model="optionsValue">
            <el-checkbox v-for="(item,index) in optionsValue" :key="index">{{ item }}</el-checkbox>
          </el-checkbox-group>

          <el-input clearable v-else-if="typeValue==='single_line_text'"
                    type="text" style="max-width: 80%"
                    placeholder="请输入内容（单行文本）"
          ></el-input>

          <el-input clearable v-else-if="typeValue==='multi_line_text'"
                    type="textarea" style="max-width: 80%"
                    placeholder="请输入内容（多行文本）"
          ></el-input>

          <el-input-number clearable v-else-if="typeValue==='number'" type="number"
                           style="max-width: 200px" controls-position="right"
                           placeholder="请输入数字"
                           :step="1"
          ></el-input-number>

          <el-rate v-else-if="typeValue==='grade'" :max="gradeMaxValue"></el-rate>

          <el-date-picker v-else-if="typeValue==='date'" v-model="dateValue" format="yyyy-MM-dd HH:mm:ss"
                          value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>

          <div v-else-if="typeValue==='text_description'" class="description-div">
            {{ textDescriptionValue }}
          </div>

          <div v-if="frontChoose">
            <el-divider></el-divider>
            <div v-for="(item,index) in frontOptionsValue" :key="index">
              前置选项{{ index + 1 }}：
              <el-cascader
                :value="item"
                :options="frontOptions"
                :disabled="true"
              ></el-cascader>
            </div>
          </div>
        </div>

        <div class="edit-icon"><em class="el-icon-edit-outline"></em></div>
      </div>

      <div class="box-is-selected" v-if="isBoxSelected">
        <div class="question-index">{{ questionIndex + 1 }}</div>
        <el-form>
          <el-form-item label="题目：">
            <el-input clearable type="text" v-model="questionTitleValue" size="medium" class="description-div"
                      placeholder="请输入题目"></el-input>
          </el-form-item>
          <el-form-item label="描述：">
            <el-input clearable type="text" v-model="questionDescriptionValue" size="medium" class="description-div"
                      placeholder="请输入描述"></el-input>
          </el-form-item>
          <el-row>
            <el-col :span="9">
              <el-form-item label="类型：">
                <el-select v-model="typeValue" placeholder="请选择" size="medium">
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="选填：">
                <el-tooltip :content="questionNullableValue===true?'是':'否'" placement="top" effect="light">
                  <el-switch
                    v-model="questionNullableValue"
                    active-color="#13ce66"
                    inactive-color="#ff4949">
                  </el-switch>
                </el-tooltip>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="前置：">
                <el-tooltip placement="top" effect="light" content="是否启用级联选择（在用户选择了前置某些选项时出现）">
                  <el-switch
                    v-model="frontChooseValue"
                    :disabled="questionIndex===0"
                    active-color="#13ce66"
                    inactive-color="#ff4949">
                  </el-switch>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>

          <div v-if="frontChooseValue===true" :key="questionIndex">
            <el-form-item v-for="(item,index) in frontOptionsValue" :key="index"
                          :label="'前置选项'+(index+1)+'：'">
              <el-cascader
                v-model="frontOptionsValue[index]"
                :options="frontOptions"
                :props="{ expandTrigger: 'hover' }"></el-cascader>
              <el-tooltip effect="light"
                          content="在下方添加"
                          :open-delay="200"
                          :hide-after="1500"
                          placement="top">
                <el-button size="medium" round class="add-option-button"
                           @click="addFrontOption"
                ><em class="el-icon-plus"></em>
                </el-button>
              </el-tooltip>
              <el-tooltip effect="light"
                          content="删除该选项"
                          :open-delay="200"
                          :hide-after="1500"
                          placement="top">
                <el-button size="medium" round class="delete-option-button"
                           @click="deleteFrontOption(index)" v-if="index!==0"
                ><em class="el-icon-delete"></em>
                </el-button>
              </el-tooltip>
            </el-form-item>
          </div>

          <el-divider class="divider"></el-divider>

          <div v-if="typeValue==='single_check'||typeValue==='multi_check'">
            <el-form-item v-for="(item,index) in optionsValue" :key="index">
              选项{{ index + 1 }}：
              <el-input clearable v-model="optionsValue[index]" style="max-width: 300px"
                        @input="inputVerify"></el-input>
              <el-tooltip effect="light"
                          content="在下方添加"
                          :open-delay="200"
                          :hide-after="1500"
                          placement="top">
                <el-button size="medium" round class="add-option-button"
                           @click="addOption"
                ><em class="el-icon-plus"></em>
                </el-button>
              </el-tooltip>
              <el-tooltip effect="light"
                          content="删除该选项"
                          :open-delay="200"
                          :hide-after="1500"
                          placement="top">
                <el-button size="medium" round class="delete-option-button"
                           @click="deleteOption(index)" v-if="index!==0"
                ><em class="el-icon-delete"></em>
                </el-button>
              </el-tooltip>
            </el-form-item>
          </div>

          <div v-if="typeValue==='number'">
            <el-form-item label="数字类型：">
              <el-select v-model="numberTypeValue" placeholder="请选择数字类型" size="medium">
                <el-option
                  v-for="item in numberTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="默认数值：">
              <el-input-number v-model="defaultNumberValue"></el-input-number>
            </el-form-item>
          </div>

          <div v-if="typeValue==='grade'">
            <el-form-item>
              最大分数
              <el-input-number v-model="gradeMaxValue"></el-input-number>
            </el-form-item>
          </div>

          <div v-if="typeValue==='text_description'">
            <el-form-item label="内容：">
              <el-input clearable v-model="textDescriptionValue" type="textarea" style="max-width: 400px"
                        size="medium"></el-input>
            </el-form-item>
          </div>

          <el-form-item>
            <el-button type="primary" @click="saveOneQuestion">暂存</el-button>
            <el-button @click="resetQuestion">重置</el-button>
            <el-button @click="clickUnSelected">收起</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-button class="delete-button" type="danger" icon="el-icon-delete" circle @click="clickDelete"></el-button>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Question",
  props: {
    nanoid: String,
    isBoxSelected: Boolean,
    questionId: Number,
    questionnaireId: Number,
    questionIndex: Number,
    questionTitle: String,
    questionNullable: Boolean,
    questionType: String,
    questionDescription: String,
    questionOptions: Array,
    frontChoose: Boolean,
    frontOptions: Array,
    frontOptionsInitValue: Array,
    numberType: String,
    defaultNumber: Number,
    gradeMax: Number,
    date: Date,
    textDescription: String,
  },
  data() {
    return {
      typeOptions: [
        {
          value: 'not_selected',
          label: '请输入'
        }, {
          value: 'single_check',
          label: '单选'
        }, {
          value: 'multi_check',
          label: '多选'
        }, {
          value: 'single_line_text',
          label: '单行文本'
        }, {
          value: 'multi_line_text',
          label: '多行文本'
        }, {
          value: 'number',
          label: '数字'
        }, {
          value: 'grade',
          label: '评分'
        }, {
          value: 'date',
          label: '日期'
        }, {
          value: 'text_description',
          label: '文本描述'
        }],
      numberTypeOptions: [{
        value: 'integer',
        label: '整数'
      }, {
        value: 'fraction',
        label: '小数'
      }],
      questionTitleValue: this.questionTitle,
      questionDescriptionValue: this.questionDescription,
      questionNullableValue: this.questionNullable,
      numberTypeValue: this.numberType,
      defaultNumberValue: this.defaultNumber,
      typeValue: this.questionType,
      optionsValue: this.questionOptions,
      gradeMaxValue: this.gradeMax,
      dateValue: this.date,
      textDescriptionValue: this.textDescription,
      frontChooseValue: this.frontChoose,
      frontOptionsValue: this.frontOptionsInitValue,
    }
  },
  methods: {
    inputVerify(str) {
      if (!str)
        this.$modal.msgWarning('不可为空哈')
    },
    clickUnSelected() {
      this.$emit('clickUnSelected');
    },
    saveOneQuestion() {
      let flag = false
      this.$emit('saveOneQuestion', this.questionData, res => {
        flag = res
      })
      if (flag)
        this.$emit('clickSelected');
    },
    resetQuestion() {
      this.$emit('resetQuestion');
      this.questionTitleValue = "";
      this.questionDescriptionValue = "";
      this.typeValue = 'not_selected';
      this.questionNullableValue = false;
      this.optionsValue = [];
      this.frontOptionsValue = [[]];
      this.frontChooseValue = false;
      this.numberTypeValue = 'integer';
      this.defaultNumberValue = 0;
      this.gradeMaxValue = 5;
      this.dateValue = new Date();
      this.textDescriptionValue = '';
    },
    clickDelete() {
      this.$emit('clickDelete');
    },
    addOption() {
      this.optionsValue.push('');
    },
    deleteOption(index) {
      this.optionsValue.splice(index, 1);
    },
    addFrontOption() {
      this.frontOptionsValue.push([]);
    },
    deleteFrontOption(index) {
      this.frontOptionsValue.splice(index, 1);
    },
  },
  computed: {
    questionData: function () {
      return {
        nanoid: this.nanoid,
        questionId: this.questionId,
        questionnaireId: this.questionnaireId,
        questionIndex: this.questionIndex,
        questionTitle: this.questionTitleValue,
        questionDescription: this.questionDescriptionValue,
        questionType: this.typeValue,
        questionNullable: this.questionNullableValue,
        details: {
          questionOptions: this.optionsValue,
          frontOptions: this.frontOptionsValue,
          frontChoose: this.frontChooseValue,
          numberType: this.numberTypeValue,
          defaultNumber: this.defaultNumberValue,
          gradeMax: this.gradeMaxValue,
          date: this.dateValue,
          textDescription: this.textDescriptionValue,
        },
      };
    }
  }
}
</script>

<style scoped>
.box-is-not-selected {
  position: relative;
  text-align: left;
  margin-left: 20%;
  line-height: 40px;
}

.nullable-star {
  color: red;
}

.delete-button {
  position: absolute;
  right: 10%;
  top: 40%;
  /*top: 20px;*/
}

.question-index {
  position: absolute;
  left: 10%;
  top: 40%;
  font-size: 30px;
  /*margin-bottom: 20px;*/
}

.box-card {
  transition: all ease 300ms;
}

.delete-button {
  position: absolute;
}

.box-is-selected {
  text-align: left;
  margin-top: 30px;
  margin-bottom: 30px;
  margin-left: 20%;
}

.box-is-not-selected-wrapper {
  padding-top: 20px;
  padding-bottom: 20px;
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

.divider {
  max-width: 80%;
}

.add-option-button {
  margin-left: 10px;
}

.description-div {
  max-width: 60%;
}
</style>
