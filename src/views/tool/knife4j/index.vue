<template>
  <i-frame :src="url" />
</template>
<script>
import iFrame from "@/components/iFrame";
export default {
  name: "Knife4j",
  components: { iFrame },
  data() {
    return {
      url: process.env.VUE_APP_BASE_API + "/doc.html"
    };
  },
};
</script>
