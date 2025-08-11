<script>
export default {
  name: "ResultPage",

  data(){
    return{
      result: [],
    }
  },

  methods: {
    /**
     * @description: 获取月度结算
     * @author 13299
     */
    getMonthResult(){
      this.$axios({
        url: this.$baseUrl + "/api/getMonthResult",
        method: "GET"
      }).then(res => {
        if (res.data.code === 0){
          this.result = res.data.data;
        }
      });
    },

    /**
     * @description: 推送至收据页面
     * @author 13299
     */
    goToMain(){
      this.$router.push({ //推送至收据页面
        path: "/MainPage",
      });
    }
  },

  created() {
    this.getMonthResult();
  }
}
</script>

<template>
  <button class="btn btn-outline-primary switch" @click="goToMain">切换</button>
  <div class="center-box">
    <div class="card">
      <table class="table table-striped table-hover">
        <thead>
        <tr>
          <th scope="col">年份</th>
          <th scope="col">月份</th>
          <th scope="col">沈艺童's</th>
          <th scope="col">徐涵浩's</th>
          <th scope="col">吴锋's</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in result" :key="item.id">
          <td>{{item.year}}</td>
          <td>{{item.month}}</td>
          <td>{{item.shen}}</td>
          <td>{{item.xu}}</td>
          <td>{{item.wu}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

.center-box{
  display: flex;
  align-items: center;
  flex-direction: column;
  font-size: 15px;
}

.card{
  width: 70%;
  margin-right: 20px;
  margin-left: 20px;
  margin-top: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.switch{
  position: absolute;
  left: 10px;
  top: 10px;
}
</style>