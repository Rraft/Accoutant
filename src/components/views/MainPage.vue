<script>
export default {
  name: "MainPage",

  data(){
    return{
      receipts:[],
      rows: 1, //总页数，十条一页
      row: 1, //当前所在页码，展示至多9个页码
      leftRow: 0, //翻页条左界
      rightRow: 0, //翻页条右界
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
      serviceCharge: 10,
      GST: 9,
    }
  },

  methods: {
    /**
     * @description: 获取所有的收据信息
     * @author 13299
     */
    getAllReceipts(){
      const data = {
        pageNo: this.row,
        pageSize: 20,
      };
      this.$axios({
        url: this.$baseUrl + "/api/getAllReceipts",
        method: "POST",
        data: data,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        }
      }).then(res => {
        this.receipts = res.data.data.records;
        this.rows = res.data.data.total / 20; //设置rows属性，二十条一页
        if ((res.data.data.total / 20) % 1 !== 0){ //判断对象数量能不能被20整除
          this.rows = Math.floor(res.data.data.total / 20) + 1; //不能则多设置一页存放多余对象
        }
        if (this.rows > 9){ //若总页数大于9，则设置初始右界为9
          this.rightRow = 9;

        }else { //若不足9页，则设置页数为初始右界
          this.rightRow = this.rows;
        }
      });
    },

    /**
     * @description: 跳转至下一页
     * @author 13299
     */
    nextPage(){
      if (this.row < this.rows){
        this.row++;
        if (this.row > this.rightRow-1 && this.rightRow < this.rows){ //在页码将等于右界时将页码范围右移
          this.rightRow++;
          this.leftRow++;
        }
      }
      this.getAllReceipts();
    },

    /**
     * @description: 跳转至上一页
     * @author 13299
     */
    previousPage(){
      if (this.row > 1){
        this.row--;
        if (this.row === this.leftRow+1 && this.leftRow > 0){ //在页码将等于左界时将页码范围左移
          this.rightRow--;
          this.leftRow--;
        }
      }
      this.getAllReceipts();
    },

    /**
     * @description: 跳转至指定页码
     * @author 13299
     */
    jumpPage(index){
      this.row = index;
      if (index - 5 < 0){ //在跳转目标小于5时，设置左界为1
        this.leftRow = 0;
        if (this.rows > 9) //右界为9或页码数
          this.rightRow = 9;
        else
          this.rightRow = this.rows;

      }else if (index + 4 > this.rows){ //在跳转目标离总页数小于4时，设置右界为总页数
        this.rightRow = this.rows;
        if (this.rows - 9 < 0) //左界为1或总页数-9
          this.leftRow = 0;
        else
          this.leftRow = this.rows - 9;

      }else { //中间正常情况，始终保持跳转目标为左右界中间值
        this.leftRow = this.row - 5;
        this.rightRow = this.row + 4;
      }
      this.getAllReceipts();
    },

    /**
     * @description: 保存收据至数据库
     * @author 13299
     */
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

    /**
     * @description: 根据id删除收据
     * @author 13299
     */
    deleteReceipt(id){
      let formData = new FormData();
      formData.append("id", id);
      this.$axios({
        url: this.$baseUrl + "/api/deleteReceiptById",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }).then(res => {
        if (res.data.code === 0){
          this.getAllReceipts();
        }
      });
    },

    /**
     * @description: 添加收据的消费人
     * @author 13299
     */
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

    /**
     * @description: 自动计算账单总价
     * @author 13299
     */
    autoSum(){
      this.totalAmount = this.xu + this.shen + this.wu;
    },

    /**
     * @description: 根据消费人自动分账
     * @author 13299
     */
    autoSplit(){
      let perPerson = this.totalAmount / this.consumerCount;
      perPerson = parseFloat(perPerson.toFixed(2));
      if (this.consumer.xu)
        this.xu += perPerson;
      if (this.consumer.shen)
        this.shen += perPerson;
      if (this.consumer.wu)
        this.wu += perPerson;
    },

    /**
     * @description: 自动根据服务费率和税率计算消费
     * @author 13299
     */
    autoGST(){
      const rate = (100 + this.serviceCharge) * (100 + this.GST) / 10000;
      this.xu = parseFloat((this.xu * rate).toFixed(2));
      this.wu = parseFloat((this.wu * rate).toFixed(2));
      this.shen = parseFloat((this.shen * rate).toFixed(2));
    },

    /**
     * @description: 推送至结果页面
     * @author 13299
     */
    goToResult(){
      this.$router.push({ //推送至结果页面
        path: "/ResultPage",
      });
    }
  },

  computed: {
    /**
     * @description: 根据rows属性迭代出页码列表
     * @author 13299
     */
    generatedRows(){
      return Array.from({ length: this.rows }, (_, index) => ({ id: index + 1 }));
    },
  },

  created() {
    this.getAllReceipts();
  }
}
</script>

<template>
  <button class="btn btn-outline-primary switch" @click="goToResult">结算</button>
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
      <div class="mb-3">
        <label for="totalAmount" class="form-label">服务费率(%)</label>
        <input type="number" step="1" class="form-control" id="totalAmount" placeholder="服务费率" v-model="serviceCharge">
      </div>
      <div class="mb-3">
        <label for="totalAmount" class="form-label">税率(%)</label>
        <input type="number" step="1" class="form-control" id="totalAmount" placeholder="税率" v-model="GST">
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
        <button type="button" class="btn btn-secondary" @click="autoSum">计算总价</button>
        <button type="button" class="btn btn-secondary" @click="autoSplit">自动分配</button>
        <button type="button" class="btn btn-secondary" @click="autoGST">自动计税</button>
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
          <th scope="col">删除</th>
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
          <td><button class="btn btn-outline-danger btn-sm" @click="deleteReceipt(item.id)"
                      style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .4rem; --bs-btn-font-size: .85rem;">删除</button></td>
        </tr>
        </tbody>
      </table>
      <ul class="pagination">
        <li class="page-item">
          <a class="page-link" @click="jumpPage(1)">
            <span><i class="bi bi-chevron-bar-left"></i></span>
          </a>
        </li>
        <li class="page-item">
          <a class="page-link" @click="previousPage">
            <span>&laquo;</span>
          </a>
        </li>
        <li class="page-item" v-for="{id} in generatedRows.slice(leftRow, rightRow)" @click="jumpPage(id)" :key="id"><a class="page-link" :class="{'chosen': id === row}">{{ id }}</a></li>
        <li class="page-item">
          <a class="page-link" @click="nextPage">
            <span>&raquo;</span>
          </a>
        </li>
        <li class="page-item">
          <a class="page-link" @click="jumpPage(this.rows)">
            <span><i class="bi bi-chevron-bar-right"></i></span>
          </a>
        </li>
      </ul>
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

.pagination{
  display: flex;
  justify-content: center;
}

.page-item{
  cursor: pointer;
}

.switch{
  position: absolute;
  left: 10px;
  top: 10px;
}

.chosen{
  color: white;
  background-color: #0d6efd;
}
</style>