<template>
  <div style="border: 1px solid #ccc;">
    <Editor
      :editorId="editorId"
      :defaultConfig="editorConfig"
      :defaultHtml="getDefaultHtml"
      :mode="mode"
    />
  </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css'
import {Editor, getEditor, removeEditor} from '@wangeditor/editor-for-vue'

export default {
  name: "WangEditorView",
  components: {Editor},
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // WangEditor config
      editor: null,
      editorId: `w-e-${Math.random().toString().slice(-5)}`, // 定义一个编辑器 id ，要求：全局唯一且不变！！！
      mode: 'default', // or 'simple'
      editorConfig: {
        placeholder: '',
        readOnly: true,
      },
      defaultHtml: '',
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
    }
  },
  beforeDestroy() {
    this.destroy()
  },
  methods: {
    destroy() {
      console.log('this.editor', this.editor)
      if (this.editor == null) return
      // 【注意】组件销毁时，及时销毁编辑器
      this.editor.destroy()
      removeEditor(this.editorId)
    },
  }
}
</script>

<style></style>
