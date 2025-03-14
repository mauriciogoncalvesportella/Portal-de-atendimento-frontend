export default {
  install(Vue, options) {
    Vue.prototype.$calculate = function (data) {
      data.sort((a, b) => a.dtinicio - b.dtinicio);
      let time = 0;
      for (let i = 0; i < data.length; i++) {
        const daVez = data[i];
        if (!daVez.inutil) {
          time += daVez.dtfim - daVez.dtinicio;
          data = data.map((it) => {
            let inutil = false;
            if (daVez.dtfim >= it.dtfim) {
              inutil = true;
            } else if (daVez.dtfim > it.dtinicio) {
              it.dtinicio = daVez.dtfim;
            }

            return {
              ...it,
              inutil: inutil,
            };
          });
        }
      }
      return time;
    };

    Vue.prototype.$condense = function (data) {
      data.sort((a, b) => a.dtinicio - b.dtinicio);
      const condensedArray = [];
      let itemObj = {};
      for (const curr of data) {
        if (itemObj.dtinicio == null) {
          itemObj.dtinicio = curr.dtinicio;
          itemObj.dtfim = curr.dtfim;
        } else if (
          curr.dtinicio <= itemObj.dtfim &&
          curr.dtfim > itemObj.dtfim
        ) {
          itemObj.dtfim = curr.dtfim;
        } else if (curr.dtinicio > itemObj.dtfim) {
          condensedArray.push(Object.assign({}, itemObj));
          itemObj = curr;
        }
      }
      return condensedArray;
    };

    Vue.prototype.$validateTimesElapses = function (data) {
      if (
        data.some((it) => {
          if (!it.dtinicio || !it.dtfim) {
            return true;
          }
          if (
            !this.$moment(it.dtinicio).isValid() ||
            !this.$moment(it.dtfim).isValid()
          ) {
            return true;
          }
        })
      ) {
        return false;
      }

      const timesElapses = data.map((it) => {
        return {
          dtinicio: this.$moment(it.dtinicio).valueOf(),
          dtfim: this.$moment(it.dtfim).valueOf(),
        };
      });

      let oldDtfim = -1;
      for (const timeElapse of timesElapses) {
        const { dtinicio, dtfim } = timeElapse;
        if (dtinicio < oldDtfim || dtinicio > dtfim) {
          return false;
        }
        oldDtfim = dtfim;
      }

      return true;
    };

    // Soma todos os atendimentos e retorna se o atendimento é para ser selecionado
    Vue.prototype.$sumAtendimentos = function (atendimentos, serverTime) {
      let isIndex = false;
      let sum = 0;
      serverTime = serverTime ?? new Date().getTime();
      if (atendimentos != null && atendimentos.length > 0) {
        sum = atendimentos.reduce((acc, curr) => {
          const dtinicio = new Date(curr.dtinicio).getTime();
          let dtfim;
          if (curr.dtfim == null) {
            isIndex = true;
            dtfim = serverTime;
          } else {
            dtfim = new Date(curr.dtfim).getTime();
          }
          return acc + (dtfim - dtinicio);
        }, 0);
      } else {
        sum = 0;
      }

      return {
        sum,
        isIndex,
      };
    };

    Vue.prototype.$raw2select = function (data, value, text) {
      return data.map((item) => {
        return {
          value: item[value],
          text: item[text],
          raw: item,
        };
      });
    };

    Vue.filter("extractInitials", (str) => {
      str = str.split(" ");
      let ret = "";
      for (const ord of str) {
        if (ord[0] === ord[0].toUpperCase()) {
          ret += ord[0];
        }
      }
      return ret;
    });
  },
};
