<template>
  <div v-if="img" class="item hover-mask">
    <!--    图片区域-->
    <img
      alt=""
      :src="img"
    >
    <!--    标题-->
    <span class="video-title">{{ title }}</span>
    <!--    时长-->
    <span class="video-duration">{{ duration }}</span>
    <!--    自定义点击事件-->
    <span @click="handleClick" class="hover-mask_actions">
          <slot name="action"></slot>
    </span>
  </div>
</template>

<script>

export default {
  props: {
    title: {
      type: String,
      default: 'Title'
    },
    duration: {
      type: String,
      default: '00:00'
    },
    img: {
      type: String,
      default: require('@/assets/images/video-icon.png')
    },

  },
  data: function () {
    return {}
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.hover-mask {
  position: relative;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: auto;
  height: auto;
  display: inline-block;
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  font-size: 14px;
  color: #606266;
  line-height: 0;
}

.hover-mask_actions {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  cursor: default;
  text-align: center;
  color: #fff;
  opacity: 0;
  font-size: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
}

.hover-mask_actions > * {
  cursor: pointer;
  padding: 5px;
  margin: 0 3px;
}

.hover-mask_actions::after {
  display: inline-block;
  content: "";
  height: 100%;
  vertical-align: middle;
}

.hover-mask_actions:hover {
  opacity: 1;
}

.item {
  position: relative;
  width: 269px;
  height: 152px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.item img {
  width: 100%;
  display: block;
}

.video-title {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  line-height: 23px;
  color: #fff;
  font-size: 14px;
  background-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.6),
    rgba(119, 119, 119, 0.1)
  );
  padding: 2px 5px 5px;
  /* 一行显示 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.video-duration {
  background: rgba(0,0,0,.5);
  border-radius: 0 0 0 5px;
  color: #fff;
  line-height: 20px;
  transition: top .2s ease;
  padding: 0 6px;
  position: absolute;
  right: 0;
  top: 0;
}
</style>
