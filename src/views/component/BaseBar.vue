<script>
  import { Bar } from 'vue-chartjs'

  export default {
    extends: Bar,
    methods: {
      render (labels, datasets) {
        this.renderChart(
          {
            labels: labels,
            datasets: datasets,
            /*
            datasets: [
              {
                label: 'Data One',
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                data: [40, 39, 10, 40, 39, 80, 40],
              },
              {
                label: 'Data two',
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                data: [20, 40, 5, 20, 50, 34, 55],
              },
            ],
            */
          },
          {
            responsive: true,
            maintainAspectRatio: false,
          },
        )
      },
    },
  }
</script>
