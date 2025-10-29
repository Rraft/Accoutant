<script>
import SideBar from "@/components/common/SideBar.vue";
import Decimal from "decimal.js";

export default {
  name: "MainPage",
  components: { SideBar },

  data() {
    return {
      warnText: "",
      originGroup: { id: null, name: "" },
      currentGroup: { id: null, name: "" },
      users: [],
      newReceipt: {
        description: "",
        dateTime: "",
        payerId: null,
      },
      totalAmount: new Decimal(0),
      serviceCharge: new Decimal(10),
      GST: new Decimal(9),
      // 组选择相关
      groupList: [],
      groupSearch: "",
      groupPageNo: 1,
      groupPageSize: 10,
      groupTotal: 0,
    };
  },

  methods: {
    /**
     * @description: 重置警告栏
     * @author 13299
     */
    alertInit(el) {
      el.style.display = "none";
      el.style.animation = "none";
    },

    /**
     * @description: 获取分组分页
     * @author 13299
     */
    async fetchGroupList(page = 1) {
      this.groupPageNo = page;
      const res = await this.$axios({
        url: this.$baseUrl + "/group/getPage",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: {
          pageSize: this.groupPageSize,
          pageNo: this.groupPageNo,
          keyword: this.groupSearch,
        },
      });
      const { records, total } = res.data.data;
      this.groupList = records || [];
      this.groupTotal = total || 0;
    },

    /**
     * @description: 根据分组获取用户
     * @author 13299
     */
    getUserByGroup() {
      this.$axios({
        url: this.$baseUrl + "/user/getUserByGroup",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        params: { groupId: this.currentGroup.id },
      }).then((res) => {
        this.users = res.data.data;
        this.users.forEach((user) => {
          user.active = false;
          user.amount = new Decimal(0);
        });
      });
    },

    /**
     * @description: 打开Modal，存储原分组
     * @author 13299
     */
    openModal() {
      this.originGroup = this.currentGroup;
      this.getUserByGroup(1);
    },

    /**
     * @description: 关闭Modal，不更换分组重新添入原分组
     * @author 13299
     */
    cancelFilter() {
      this.currentGroup = this.originGroup;
      this.groupSearch = "";
    },

    /**
     * @description: 更换分组
     * @author 13299
     */
    doFilter() {
      this.getUserByGroup();
    },

    /**
     * @description: 设置用户激活状态，用于自动分账
     * @author 13299
     */
    setActive(user) {
      user.active = !user.active;
    },

    /**
     * @description: 自动计算账单总价（使用 Decimal 精确求和）
     * @author 13299
     */
    autoSum() {
      let sum = new Decimal(0);
      this.users.forEach((user) => {
        const amt = new Decimal(user.amount || 0);
        sum = sum.plus(amt);
      });
      this.totalAmount = sum;
    },

    /**
     * @description: 根据消费人自动分账（加）
     * @author 13299
     */
    autoAdd() {
      const consumers = this.users.filter((u) => u.active);
      if (consumers.length === 0) return;

      const perPerson = new Decimal(this.totalAmount)
          .div(consumers.length)
          .toDecimalPlaces(2);

      this.users.forEach((user) => {
        if (user.active) {
          user.amount = new Decimal(user.amount || 0).plus(perPerson).toDecimalPlaces(2);
        }
      });
    },

    /**
     * @description: 根据消费人自动分账（减）
     * @author 13299
     */
    autoMinus() {
      const consumers = this.users.filter((u) => u.active);
      if (consumers.length === 0) return;

      const perPerson = new Decimal(this.totalAmount)
          .div(consumers.length)
          .toDecimalPlaces(2);

      this.users.forEach((user) => {
        if (user.active) {
          user.amount = new Decimal(user.amount || 0).minus(perPerson).toDecimalPlaces(2);
        }
      });
    },

    /**
     * @description: 自动根据服务费率和税率计算消费
     * @author 13299
     */
    autoGST() {
      const rate = new Decimal(100)
          .plus(this.serviceCharge)
          .times(new Decimal(100).plus(this.GST))
          .div(10000); // ((100+serviceCharge)*(100+GST))/10000

      this.users.forEach((user) => {
        if (user.active) {
          user.amount = new Decimal(user.amount || 0).times(rate).toDecimalPlaces(2);
        }
      });
    },

    /**
     * @description: 新建收据
     * @author 13299
     */
    add() {
      // 发送前转为普通数值
      this.newReceipt.groupId = this.currentGroup.id;
      this.newReceipt.consumers = this.users.map((u) => ({
        ...u,
        amount: new Decimal(u.amount || 0).toNumber(),
      }));
      this.$axios({
        url: this.$baseUrl + "/receipt/add",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: this.newReceipt,
      }).then((res) => {
        if (res.data.code === 0) {
          this.users.forEach(user => {
            user.amount = new Decimal(0);
            this.newReceipt.description = "";
            this.newReceipt.dateTime = "";
            this.newReceipt.payerId = null;
            this.totalAmount = new Decimal(0);
          })
        } else {
          this.warnText = `${res.data.code}: ${res.data.msg}`;
          this.$refs.warn.style.display = "flex";
          this.$refs.warn.style.animation = "fadeOut 2s ease both";
          setTimeout(this.alertInit, 2000, this.$refs.warn);
        }
      });
    },
  },

  computed: {
    groupTotalPages() {
      return Math.ceil(this.groupTotal / this.groupPageSize);
    },
  },

  async created() {
    await this.fetchGroupList(1);
    if (this.groupList.length > 0) {
      this.currentGroup = this.groupList[0];
      this.getUserByGroup();
    }
  },
};
</script>

<template>
  <div class="outer">
    <div class="alert alert-danger" role="alert" ref="warn">
      {{ warnText }}
    </div>
    <side-bar></side-bar>
    <div class="card panel">
      <div class="card title">
        <i class="bi bi-person"></i>
        <span class="me-3">新建收据</span>
        <div class="input-group modal-input">
          <span class="input-group-text">当前分组</span>
          <input type="text" class="form-control" readonly style="max-width: 300px;" v-model="currentGroup.name">
          <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#filterModal" @click="openModal">选择</button>
        </div>
      </div>
      <div class="card">
        <div class="mb-3">
          <label for="description" class="form-label">描述</label>
          <input type="text" class="form-control" id="description" placeholder="消费描述" v-model="newReceipt.description">
        </div>
        <div class="mb-3">
          <label for="date" class="form-label">消费时间</label>
          <input type="datetime-local" class="form-control" id="date" v-model="newReceipt.dateTime">
        </div>
        <div class="mb-3">
          <label for="totalAmount" class="form-label">总价</label>
          <input type="number" step="0.01" class="form-control" id="totalAmount" placeholder="总价" v-model="totalAmount">
        </div>
        <div class="mb-3">
          <label for="totalAmount" class="form-label">服务费率(%)</label>
          <input type="number" step="1" class="form-control" id="totalAmount" placeholder="服务费率" v-model="serviceCharge">
        </div>
        <div class="mb-3">
          <label for="totalAmount" class="form-label">税率(%)</label>
          <input type="number" step="1" class="form-control" id="totalAmount" placeholder="税率" v-model="GST">
        </div>
        <div class="mb-3">
          <label for="payerSelector" class="form-label">付款人</label>
          <select class="form-select mb-3" v-model="newReceipt.payerId" id="payerSelector">
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
        <div v-for="user in users" class="input-group mb-3">
          <button class="btn btn-outline-primary" @click="setActive(user)" :class="{ active: user.active}" data-bs-placement="top">{{user.name}}</button>
          <input type="number" step="0.01" class="form-control" placeholder="手动输入配额" v-model="user.amount">
        </div>
        <div class="mb-3">
          <div class="d-inline-flex gap-1">
            <button type="button" class="btn btn-secondary" @click="autoSum">计算总价</button>
            <button type="button" class="btn btn-secondary" @click="autoAdd">增量分配</button>
            <button type="button" class="btn btn-secondary" @click="autoMinus">减量分配</button>
            <button type="button" class="btn btn-secondary" @click="autoGST">自动计税</button>
            <button type="button" class="btn btn-primary" @click="add">保存</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="filterModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">选择分组</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="input-group modal-input">
              <div class="w-100">
                <div class="input-group mb-2">
                  <input
                      type="text"
                      class="form-control"
                      placeholder="搜索分组..."
                      v-model="groupSearch"
                      @keyup.enter="fetchGroupList(1)"
                  >
                  <button
                      type="button"
                      class="btn btn-outline-success"
                      @click="fetchGroupList(1)">
                    搜索
                  </button>
                </div>
                <select class="form-select" v-model="currentGroup.id">
                  <option disabled value="0">请选择分组</option>
                  <option v-for="group in groupList" :key="group.id" :value="group.id">
                    {{ group.name }}
                  </option>
                </select>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <button
                      class="btn btn-outline-secondary btn-sm"
                      :disabled="groupPageNo === 1"
                      @click="fetchGroupList(groupPageNo - 1)">
                    上一页
                  </button>
                  <span>第 {{ groupPageNo }} 页 / 共 {{ groupTotalPages }} 页</span>
                  <button
                      class="btn btn-outline-secondary btn-sm"
                      :disabled="groupPageNo === groupTotalPages"
                      @click="fetchGroupList(groupPageNo + 1)">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="cancelFilter">取消</button>
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="doFilter">筛选</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.outer{
  display: flex;
}

.card{
  width: 100%;
  margin-right: 20px;
  margin-left: 20px;
  margin-top: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.panel{
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 15px;
}

.title {
  font-size: 30px;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  gap: 20px;
  flex-wrap: nowrap;
  align-items: center;
}

.title .input-group {
  width: auto;
  flex: 0 0 auto;
  font-size: 16px; /* 可选：防止按钮太厚 */
}

.modal-input{
  margin: 20px;
  width: 90%;
}

.alert-danger{
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 400px;
  height: 100px;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

button {
  white-space: nowrap;
}
</style>