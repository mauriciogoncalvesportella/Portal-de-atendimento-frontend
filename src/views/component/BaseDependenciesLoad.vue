<script>
  export default {
    data () {
      return {
        mutationDependencies: {},
        dependenciesLoaded: false,
      }
    },

    watch: {
      $route (route) {
        if (route.name === this.dependenciesConfig.route) {
          this.init()
        }
      },
    },

    created () {
      this.init()
    },

    methods: {
      init () {
        this.dependenciesLoaded = false
        // Executa método opcional antes de resolver as dependencias
        if (this.dependenciesConfig.executeBefore) {
          this.dependenciesConfig.executeBefore()
        }

        // Marca todas as depencias como não carregadas
        for (const dependencie of this.dependenciesConfig.dependencies) {
          this.mutationDependencies[dependencie.mutation] = false
        }

        // Ouve por mutações no state, se houver alguma mutação requerida pela
        // depencia, então marca a dependencia como carrega
        for (const dependencie of this.dependenciesConfig.dependencies) {
          this.$store.subscribe((mutation, state) => {
            if (mutation.type === dependencie.mutation) {
              this.mutationDependencies[dependencie.mutation] = true
              this.checkAllDependenciesLoaded()
            }
          })
        }

        // Executa todas as actions das dependencias
        for (const dependencie of this.dependenciesConfig.dependencies) {
          this.$store.dispatch(dependencie.action, { mutex: true, force: false })
        }
      },

      checkAllDependenciesLoaded () {
        for (const curr in this.mutationDependencies) {
          if (!this.mutationDependencies[curr]) {
            return
          }
        }
        if (!this.dependenciesLoaded) {
          this.dependenciesLoaded = true
          if (this.dependenciesConfig.executeAfter) {
            this.dependenciesConfig.executeAfter()
          }
        }
      },
    },
  }
</script>
