<template>
  <div>
<!--    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"-->
<!--                 @change="handleCheckAllChange">全选-->
<!--    </el-checkbox>-->
    <el-checkbox-group v-model="checkedList" @change="handleCheckedCitiesChange" size="mini">
      <el-checkbox v-for="item in checkOptions" :label="item" :key="item" border>{{ translateLabel[item] }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>
<script>
const options = ['COLLECTING', 'EDITING', 'CLOSED'];
export default {
  data() {
    return {
      checkAll: false,
      checkedList: ['COLLECTING', 'EDITING', 'CLOSED'],
      translateLabel: {
        'COLLECTING': '收集中',
        'EDITING': '编辑中',
        'CLOSED': '已关闭'
      },
      checkOptions: options,
      isIndeterminate: true
    };
  },
  methods: {
    handleCheckAllChange(val) {
      this.checkedList = val ? options : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.checkOptions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.checkOptions.length;
    }
  },
  updated() {
    this.$emit('changeShow', this.checkedList);
  }
}
</script>
