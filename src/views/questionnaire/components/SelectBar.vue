<template>
  <div class="select-menu">
    <el-row>
      <el-col class="select-item" @click.native="addNewQuestion('single_check')" style="border-radius: 30px 0 0 0;">
        <em class="el-icon-circle-check"></em>
        <p>单选</p>
      </el-col>
      <el-col class="select-item" @click.native="addNewQuestion('multi_check')" style="border-radius: 0 30px 0 0;">
        <em class="el-icon-edit-outline"></em>
        <p>多选</p>
      </el-col>
      <el-col class="select-item" @click.native="addNewQuestion('single_line_text')">
        <em class="el-icon-document-remove"></em>
        <p>单行文本</p>
      </el-col>
      <el-col class="select-item" @click.native="addNewQuestion('multi_line_text')">
        <em class="el-icon-document"></em>
        <p>多行文本</p>
      </el-col>
      <el-col class="select-item" @click.native="addNewQuestion('number')">
        <em class="el-icon-s-data"></em>
        <p>数字</p>
      </el-col>
      <el-col class="select-item" @click.native="addNewQuestion('grade')">
        <em class="el-icon-star-off"></em>
        <p>评分</p>
      </el-col>
      <el-col class="select-item" @click.native="addNewQuestion('date')" style="border-radius: 0 0 0 30px;">
        <em class="el-icon-date"></em>
        <p>日期</p>
      </el-col>
      <el-col class="select-item" @click.native="addNewQuestion('text_description')" style="border-radius:  0 0 30px;">
        <em class="el-icon-warning-outline"></em>
        <p>文本描述</p>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "SelectBar",
  methods: {
    addNewQuestion(type) {
      this.$emit('addNewQuestion', type);
    }
  }
}
</script>

<style scoped>
.select-menu {
  width: 200px;
  /*background-color: white;*/
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 30px;
}

.select-item {
  width: 100px;
  padding-top: 15px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.05);
  transition: all ease 300ms;
  cursor: pointer;
}

.select-item:hover {
  width: 100px;
  box-shadow: 0 2px 10px 2px rgba(0, 0, 0, 0.1);
}
</style>
