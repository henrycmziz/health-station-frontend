<template>
  <div style="display: inline-block;margin-right: 6px">
    <el-tooltip class="item" effect="dark" :content="name" placement="top">
      <el-button plain :icon="'el-icon-' + icon" size="mini" :disabled="isDisabled">
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
  export default {
    name: 'IconBtn',
    props: {
      name: {
        type: String,
        required: true
      },
      icon: {
        type: String,
        required: true
      },
      isDisabled: {
        type: Boolean
      }
    }
  }
</script>
