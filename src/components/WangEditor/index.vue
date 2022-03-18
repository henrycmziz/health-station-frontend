<template>
  <div style="border: 1px solid #ccc;">
    <Toolbar
      v-if="toolbarIsShow"
      style="border-bottom: 1px solid #ccc"
      :editorId="editorId"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden;"
      :editorId="editorId"
      :defaultConfig="editorConfig"
      :defaultHtml="getDefaultHtml"
      :mode="mode"
      @onChange="onChange"
    />
    <!-- 注意： defaultContent （JSON 格式） 和 defaultHtml （HTML 格式），二选一 -->
  </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css'
import {Editor, getEditor, removeEditor, Toolbar} from '@wangeditor/editor-for-vue'
// import cloneDeep from 'lodash.clonedeep'

export default {
  name: "WangEditor",
  components: {Editor, Toolbar},
  props: {
    value: {
      type: String,
      default: ''
    },
    toolbarIsShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + "/common/upload", // 上传的图片服务器地址
      // headers: {
      //   Authorization: "Bearer " + getToken()
      // },
      // WangEditor config
      editor: null,
      editorId: `w-e-${Math.random().toString().slice(-5)}`, // 定义一个编辑器 id ，要求：全局唯一且不变！！！
      mode: 'default', // or 'simple'
      toolbarConfig: {
        // toolbarKeys: [ /* 显示哪些菜单，如何排序、分组 */ ],
        // excludeKeys: [ /* 隐藏哪些菜单 */ ],
      },
      editorConfig: {
        placeholder: '',
        autoFocus: true,
        // 所有的菜单配置，都要在 MENU_CONF 属性下
        MENU_CONF: {}
      },
      // defaultContent: [], // 编辑器的默认内容，只在初始化时使用
      defaultHtml: '',
      latestContent: '', // 用于存储编辑器最新的内容，onChange 时修改
      isAjaxDone: false
    };
  },
  mounted() {
    this.editor = getEditor(this.editorId)
  },
  computed: {
    getDefaultHtml() {
      // 如果父组件传入了值，将值赋值给编辑器
      if (this.value.length)
        return this.value
    },
// getDefaultContent() {
//   return cloneDeep(this.defaultContent) //【注意】深度拷贝 defaultContent ，否则会报错
// }
  },
  beforeDestroy() {
    // const editor = getEditor(this.editorId)
    console.log('beforeDestroy')
    if (this.editor == null) return
    // 【注意】组件销毁时，及时销毁编辑器
    this.editor.destroy()
    removeEditor(this.editorId)
  }
  ,
  methods: {
    onChange(editor) {
      // console.log('onChange', editor.children) // onChange 时获取编辑器最新内容
      // this.latestContent = editor.children
      this.latestContent = editor.getHtml()
      // v-model 双向绑定：把值发送到父组件
      this.$emit('input', this.latestContent)
    }
  }
}
</script>
