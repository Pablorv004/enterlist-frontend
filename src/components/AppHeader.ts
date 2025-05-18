// Import the component types from Vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    backButton: {
      type: Boolean,
      default: false
    },
    backUrl: {
      type: String,
      default: ''
    }
  }
});
