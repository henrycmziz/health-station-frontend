<template>
  <el-card class="box-card" shadow="hover">
    <div class="analysis-title">{{ questionIndex }}. {{ questionTitle }}</div>
    <el-divider></el-divider>
    <div v-if="questionType==='date'||questionType==='single_line_text'||questionType==='multi_line_text'">
      <el-table
        :data="writeValueList" height="250" style="width: 80%; margin: auto" stripe border>
        <el-table-column prop="writeValue" align="center" label="填写内容"></el-table-column>
      </el-table>
    </div>

    <div v-if="questionType==='single_check'||questionType==='multi_check'">
      <el-radio-group v-model="showBar" class="choose-show">
        <el-radio :label="true">数量</el-radio>
        <el-radio :label="false">占比</el-radio>
      </el-radio-group>
      <el-row>
        <el-col :xs="24" :sm="18" :md="18" :lg="18" :xl="18">
          <div v-show="showBar===true" :id="'barChart'+questionIndex" class="bar-chart"
               :style="{height:barHeight}"></div>
          <div v-show="showBar===false" :id="'pieChart'+questionIndex" class="pie-chart"></div>
        </el-col>

        <el-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
          <el-table
            :data="questionValueList"
            :default-sort="{prop:'value',order:'descending'}"
            class="analysis-table">
            <el-table-column
              prop="name"
              label="选项">
            </el-table-column>
            <el-table-column
              prop="value"
              label="人数">
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>

    <div v-if="questionType==='number'||questionType==='grade'">
      <el-row>
        <el-col :xs="24" :sm="18" :md="18" :lg="18" :xl="18">
          <div v-show="showBar===true" :id="'barChart'+questionIndex" class="bar-chart"
               :style="{height:barHeight}"></div>
          <div v-show="showBar===false" :id="'pieChart'+questionIndex" class="pie-chart"></div>
        </el-col>

        <el-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
          <el-table
            :data="questionValueList"
            :default-sort="{prop:'value',order:'descending'}"
            class="analysis-table">
            <el-table-column
              prop="name"
              label="内容">
            </el-table-column>
            <el-table-column
              prop="value"
              label="数值">
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import echarts from "echarts/lib/echarts"
import "echarts/lib/chart/bar"
import "echarts/lib/chart/pie"
import "echarts/lib/component/tooltip"
import {getWriteValue, getAnswerList} from "@/api/questionnaire/answer";
import {parseTime} from "@/utils/ruoyi";

export default {
  name: "AnalysisCard",
  props: {
    questionIndex: Number,
    questionId: Number,
    questionTitle: String,
    questionType: String
  },
  data() {
    return {
      showBar: true,
      writeValueList: null,
      questionValueList: [],
      barHeight: '250px',
      typeRequireList: ['single_check', 'multi_check', 'number', 'grade']
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      if (this.typeRequireList.includes(this.questionType)) {
        getAnswerList({questionId: this.questionId}).then((res) => {
          const temp = res.data;
          const dataList = [];
          for (const oneName in temp) {
            dataList.push({'name': oneName, 'value': temp[oneName]})
          }
          dataList.sort((a, b) => {
            return a.value - b.value
          });
          this.questionValueList = dataList;
          this.barHeight = this.questionValueList.length * 33 + 150 + 'px'
          this.drawBar();
          this.drawPie();
        }).catch(() => {
          this.$modal.msgError("读取失败！")
        })
      } else {
        getWriteValue({
          questionId: this.questionId
        }).then((res) => {
          this.writeValueList = res.data.filter(item => item.writeValue !== '')
          if (this.questionType === 'date')
            this.writeValueList.forEach(item => {
              item.writeValue = parseTime(new Date(item.writeValue), '{y}-{m}-{d}')
            })
        }).catch(() => {
          this.$modal.msgError("读取失败！")
        })
      }
    },
    drawBar() {
      const myBarChart = echarts.init(document.getElementById('barChart' + this.questionIndex), 'light');
      myBarChart.setOption({
        tooltip: {},
        grid: {left: '15%'},
        xAxis: {},
        yAxis: {
          data: this.questionValueList.map(x => x['name'])
        },
        series: [{
          name: '选择人数',
          type: 'bar',
          data: this.questionValueList
        }]
      });
    },
    drawPie() {
      const myPieChart = echarts.init(document.getElementById('pieChart' + this.questionIndex), 'light');
      myPieChart.setOption({
        tooltip: {},
        grid: {left: 20},
        series: [{
          name: '选择人数',
          type: 'pie',
          data: this.questionValueList
        }]
      });
    }
  }
}
</script>

<style scoped>
.bar-chart {
  width: 100%;
}

.pie-chart {
  margin-left: calc(25% - 100px);
  width: 400px;
  height: 300px;
}

.box-card {
  transition: all ease 300ms;
  text-align: left;
}

.analysis-table {
}

.choose-show {
  margin-left: 80px;
}

.analysis-title {
  margin: 15px;
  font-size: 14px;
}
</style>
