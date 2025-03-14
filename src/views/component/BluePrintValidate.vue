<script>
  export default {
    props: {
      rules: {
        type: Array,
        default: () => null,
      },
    },
    data () {
      return {
        errMsg: '',
        model: null,
      }
    },
    watch: {
      model: function (val) {
        if (val) {
          this.errMsg = null
        }
      },
    },
    created () {
      if (this.value) {
        this.model = this.value
      }
    },
    methods: {
      validate () {
        this.errMsg = null
        if (this.rules) {
          for (const func of this.rules) {
            const err = func(this.model)
            if (err !== true) {
              this.errMsg = func(this.model)
              return false
            }
          }
        }
        return true
      },

      reset () {
        this.errMsg = null
      },
    },
  }
</script>
