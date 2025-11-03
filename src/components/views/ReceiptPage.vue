<script>
import SideBar from "@/components/common/SideBar.vue";
import { showWarn, deepClone, computePagination } from "@/utils/common.js";
import {formatDateTime} from "@/utils/format.js";

export default {
  name: "ReceiptPage",
  components: {SideBar},

  data() {
    return {
      searchInfo: "",
      warnText: "",
      dataList: [],
      users: [],
      rows: 1, // 总页数
      row: 1,  // 当前页码
      leftRow: 0,
      rightRow: 0,
      modalGroup: { id: null, name: "" },
      currentGroup: { id: null, name: "" },
      editReceipt: {
        id: null,
        description: "",
        dateTime: "",
        consumers: [],
        payerId: null,
      },
      // 组选择相关
      groupList: [],
      groupSearch: "",
      groupPageNo: 1,
      groupPageSize: 10,
      groupTotal: 0,
    };
  },

  computed: {
    /**
     * @description: 主用户分页页码
     * @author 13299
     */
    generatedRows() {
      return Array.from({ length: this.rows }, (_, index) => ({ id: index + 1 }));
    },

    /**
     * @description: 下拉分页页数
     * @author 13299
     */
    groupTotalPages() {
      return Math.ceil(this.groupTotal / this.groupPageSize);
    },
  },

  methods: {
    formatDateTime,
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
        if (res.data.code === 0){
          this.users = res.data.data;
        }else {
          this.warnText = res.data.code + ":" + res.data.msg; //显示警告信息
          showWarn(this, this.warnText);
        }
      });
    },

    /**
     * @description: 获取收据分页
     * @author 13299
     */
    getPage(){
      this.$axios({
        url: this.$baseUrl + "/receipt/getPage",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: {
          pageSize: 20,
          pageNo: this.row,
          keyword: this.searchInfo,
          groupId: this.currentGroup.id,
        }
      }).then(res => {
        if (res.data.code === 0){
          const data = res.data.data;
          const { rows, leftRow, rightRow } = computePagination(data.total, 20);
          Object.assign(this, { rows, leftRow, rightRow, dataList: data.records});
        }else {
          this.warnText = res.data.code + ":" + res.data.msg; //显示警告信息
          showWarn(this, this.warnText);
        }
      });
    },

    /**
     * @description: 用户分页：下一页
     * @author 13299
     */
    nextPage() {
      if (this.row < this.rows) {
        this.row++;
        if (this.row > this.rightRow - 1 && this.rightRow < this.rows) {
          this.rightRow++;
          this.leftRow++;
        }
        this.getPage();
      }
    },

    /**
     * @description: 用户分页：上一页
     * @author 13299
     */
    previousPage() {
      if (this.row > 1) {
        this.row--;
        if (this.row === this.leftRow + 1 && this.leftRow > 0) {
          this.rightRow--;
          this.leftRow--;
        }
        this.getPage();
      }
    },

    /**
     * @description: 用户分页：跳转页
     * @author 13299
     */
    jumpPage(index) {
      this.row = index;
      if (index - 5 < 0) {
        this.leftRow = 0;
        this.rightRow = Math.min(9, this.rows);
      } else if (index + 4 > this.rows) {
        this.rightRow = this.rows;
        this.leftRow = Math.max(0, this.rows - 9);
      } else {
        this.leftRow = this.row - 5;
        this.rightRow = this.row + 4;
      }
      this.getPage();
    },

    /**
     * @description: 修改分组修改modal
     * @author 13299
     */
    openFilter(){
      this.modalGroup = deepClone(this.currentGroup);
      this.getUserByGroup();
      this.groupSearch = "";
      this.fetchGroupList(1);
    },

    /**
     * @description: 更换分组
     * @author 13299
     */
    doFilter() {
      this.currentGroup = this.modalGroup;
      this.getUserByGroup();
      this.getPage();
    },

    /**
     * @description: 打开编辑收据Modal
     * @author 13299
     */
    openEditModal(item){
      this.editReceipt = deepClone(item);
    },

    /**
     * @description: 删除收据
     * @author 13299
     */
    deleteReceipt(){
      this.$axios({
        url: this.$baseUrl + "/receipt/delete",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        params: {
          id: this.editReceipt.id,
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.getPage();
        } else {
          this.warnText = `${res.data.code}: ${res.data.msg}`;
          showWarn(this, this.warnText);
        }
      });
    },

    /**
     * @description: 修改收据
     * @author 13299
     */
    modify(){
      this.$axios({
        url: this.$baseUrl + "/receipt/modify",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: this.editReceipt,
      }).then(res => {
        if (res.data.code === 0) {
          this.getPage();
        } else {
          this.warnText = `${res.data.code}: ${res.data.msg}`;
          this.showWarn(this, this.warnText);
        }
      });
    },
  },

  async created() {
    await this.fetchGroupList(1);
    if (this.groupList.length > 0) {
      this.currentGroup = deepClone(this.groupList[0]);
      this.getPage();
      this.getUserByGroup();
    }
  },
}
</script>

<template>
  <div class="outer">
    <div class="alert alert-danger" role="alert" ref="warn">
      {{ warnText }}
    </div>
    <side-bar></side-bar>
    <div class="card panel">
      <div class="card title">
        <i class="bi bi-briefcase"></i>
        <span class="me-3">收据管理</span>
        <div class="input-group modal-input">
          <span class="input-group-text">当前分组</span>
          <input type="text" class="form-control length-limited-input" readonly v-model="currentGroup.name">
          <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#filterModal" @click="openFilter">选择</button>
        </div>
      </div>
      <div class="card search-bar">
        <form class="d-flex" role="search">
          <input class="form-control length-limited-input me-3" placeholder="搜索栏" v-model="searchInfo">
          <button type="button" class="btn btn-outline-success me-3" @click="getPage">搜索</button>
        </form>
      </div>
      <div class="card">
        <table class="table table-striped table-hover">
          <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">描述</th>
            <th scope="col">消费时间</th>
            <th scope="col">付款人</th>
            <th scope="col">付款总额</th>
            <th v-for="user in this.users" scope="col">{{user.name}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in dataList" :key="item.id" data-bs-toggle="modal" data-bs-target="#editModal" @click="openEditModal(item)">
            <td>{{item.id}}</td>
            <td>{{item.description}}</td>
            <td>{{formatDateTime(item.dateTime)}}</td>
            <td>{{item.payerName}}</td>
            <td>{{item.total}}</td>
            <td v-for="consumer in item.consumers">{{consumer.amount}}</td>
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
    <div class="modal fade" id="editModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">编辑</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="input-group modal-input">
              <span class="input-group-text">描述</span>
              <input type="text" class="form-control" v-model="editReceipt.description">
            </div>
            <div class="input-group modal-input">
              <span class="input-group-text">消费时间</span>
              <input type="datetime-local" class="form-control" v-model="editReceipt.dateTime">
            </div>
            <div v-for="consumer in editReceipt.consumers" class="input-group modal-input">
              <span class="input-group-text">{{consumer.name}}</span>
              <input type="number" step="0.01" class="form-control" v-model="consumer.amount">
            </div>
            <div class="input-group modal-input">
              <span class="input-group-text">付款人</span>
              <select class="form-select " v-model="editReceipt.payerId" id="payerSelector">
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="deleteReceipt">删除</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="modify">更新</button>
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
                <select class="form-select" v-model="modalGroup">
                  <option disabled value="0">请选择分组</option>
                  <option v-for="group in groupList" :key="group.id" :value="group">
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="doFilter">筛选</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>