<template>
  <div>
    <div class="outlineData">
      <AnalysisList/>
    </div>
    <el-divider></el-divider>
    <div class="questionList"></div>
  </div>
</template>

<script>
import AnalysisList from "./components/AnalysisList";

export default {
  name: "Analysis",
  components: {AnalysisList}
}
</script>

<style scoped>

</style>
