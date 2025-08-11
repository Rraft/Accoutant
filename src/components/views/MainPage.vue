<script>
export default {
  name: "MainPage",

  data(){
    return{
      receipts:[],
      description: "",
      dateTime: "",
      shen: 0.00,
      xu: 0.00,
      wu: 0.00,
      payer: "XU",
      consumer: {
        xu: false,
        shen: false,
        wu: false,
      },
      consumerCount: 0,
      totalAmount: 0.00,
    }
  },

  methods: {
    getAllReceipts(){
      this.$axios({
        url: this.$baseUrl + "/api/getAllReceipts",
        method: "GET",
      }).then(res => {
        this.receipts = res.data.data;
      });
    },

    saveReceipt(){
      const data = {
        description: this.description,
        dateTime: this.dateTime,
        shen: this.shen,
        xu: this.xu,
        wu: this.wu,
        payer: this.payer,
      };
      this.$axios({
        url: this.$baseUrl + "/api/saveReceipt",
        method: "POST",
        data: data,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        }
      }).then(res => {
        if (res.data.code === 0){
          this.getAllReceipts();
          this.shen = 0.00;
          this.xu = 0.00;
          this.wu = 0.00;
        }
      });
    },

    addConsumer(name){
      switch (name){
        case 'Xu':
          if (this.consumer.xu === true)
            this.consumerCount--;
          else
            this.consumerCount++;
          this.consumer.xu = !this.consumer.xu;
          break;
        case 'Shen':
          if (this.consumer.shen === true)
            this.consumerCount--;
          else
            this.consumerCount++;
          this.consumer.shen = !this.consumer.shen;
          break;
        case 'Wu':
          if (this.consumer.wu === true)
            this.consumerCount--;
          else
            this.consumerCount++;
          this.consumer.wu = !this.consumer.wu;
          break;
      }
    },

    autoSplit(){
      this.xu = 0.00;
      this.shen = 0.00;
      this.wu = 0.00;
      let perPerson = this.totalAmount / this.consumerCount;
      perPerson = parseFloat(perPerson.toFixed(2));
      if (this.consumer.xu)
        this.xu = perPerson;
      if (this.consumer.shen)
        this.shen = perPerson;
      if (this.consumer.wu)
        this.wu = perPerson;
    },
  },

  created() {
    this.getAllReceipts();
  }
}
</script>

<template>
  <div class="center-box">
    <div class="card">
      <div class="mb-3">
        <label for="description" class="form-label">描述</label>
        <input type="text" class="form-control" id="description" placeholder="消费描述" v-model="description">
      </div>
      <div class="mb-3">
        <label for="date" class="form-label">消费时间</label>
        <input type="datetime-local" class="form-control" id="date" v-model="dateTime">
      </div>
      <div class="mb-3">
        <label for="payerSelector" class="form-label">付款人</label>
        <select class="form-select mb-3" v-model="payer" id="payerSelector">
          <option selected value="XU">徐涵浩</option>
          <option value="SHEN">沈艺童</option>
          <option value="WU">吴峰</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="totalAmount" class="form-label">总价值</label>
        <input type="number" step="0.01" class="form-control" id="totalAmount" placeholder="总价值" v-model="totalAmount">
      </div>
      <div class="input-group mb-3">
        <button class="btn btn-outline-primary" @click="addConsumer('Xu')" :class="{ active: consumer.xu}" data-bs-placement="top">徐涵浩</button>
        <input type="number" step="0.01" class="form-control" placeholder="手动输入配额" v-model="xu">
      </div>
      <div class="input-group mb-3">
        <button class="btn btn-outline-primary" @click="addConsumer('Shen')" :class="{ active: consumer.shen}" data-bs-placement="top">沈艺童</button>
        <input type="number" step="0.01" class="form-control" placeholder="手动输入配额" v-model="shen">
      </div>
      <div class="input-group mb-3">
        <button class="btn btn-outline-primary" @click="addConsumer('Wu')" :class="{ active: consumer.wu}" data-bs-placement="top">吴锋</button>
        <input type="number" step="0.01" class="form-control" placeholder="手动输入配额" v-model="wu">
      </div>
      <div class="d-inline-flex gap-1">
        <button type="button" class="btn btn-secondary" @click="autoSplit">自动分配</button>
        <button type="button" class="btn btn-primary" @click="saveReceipt">保存</button>
      </div>
    </div>
    <div class="card">
      <table class="table table-striped table-hover">
        <thead>
        <tr>
          <th scope="col">消费描述</th>
          <th scope="col">消费时间</th>
          <th scope="col">沈艺童's</th>
          <th scope="col">徐涵浩's</th>
          <th scope="col">吴锋's</th>
          <th scope="col">付款人</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in receipts" :key="item.id">
          <td>{{item.description}}</td>
          <td>{{item.dateTime}}</td>
          <td>{{item.shen}}</td>
          <td>{{item.xu}}</td>
          <td>{{item.wu}}</td>
          <td>{{item.payer}}</td>
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
</style>