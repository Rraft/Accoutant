<script>
import SideBar from "@/components/common/SideBar.vue";

export default {
  name: "UserPage",
  components: { SideBar },

  data() {
    return {
      // 用户分页数据
      filter:{
        groupId: null,
      },
      searchInfo: "",
      warnText: "",
      dataList: [],
      rows: 1, // 总页数
      row: 1,  // 当前页码
      leftRow: 0,
      rightRow: 0,
      // 编辑与新增用户
      editUser: {
        id: 0,
        groupId: 0,
        name: "",
        groupName: "",
      },
      newUser: {
        groupId: 0,
        name: "",
        groupName: "",
      },
      // 组选择相关（用于编辑弹窗）
      groupList: [],
      groupSearch: "",
      groupPageNo: 1,
      groupPageSize: 10,
      groupTotal: 0,
      groupLoading: false,
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
    /**
     * @description: 复位警告栏
     * @author 13299
     */
    alertInit(el) {
      el.style.display = "none";
      el.style.animation = "none";
    },

    /**
     * @description: 根据分组筛选查询分页
     * @author 13299
     */
    doFilter(){
      this.getPage();
    },

    /**
     * @description: 删除筛选的分组id，重新查询分页
     * @author 13299
     */
    cancelFilter(){
      this.filter.groupId = null;
      this.getPage();
    },

    /**
     * @description: 获取用户分页数据
     * @author 13299
     */
    getPage() {
      this.$axios({
        url: this.$baseUrl + "/user/getPage",
        data: {
          pageSize: 20,
          pageNo: this.row,
          keyword: this.searchInfo,
          groupId: this.filter.groupId,
        },
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }).then((res) => {
        const data = res.data.data;
        this.dataList = data.records;
        this.rows = Math.ceil(data.total / 10);
        this.rightRow = Math.min(this.rows, 9);
      });
    },

    /**
     * @description: 打开编辑弹窗时加载用户信息 + group 选择第一页
     * @author 13299
     */
    openEditModal(item) {
      this.editUser = {
        id: item.id,
        groupId: item.groupId,
        name: item.name,
        groupName: item.groupName,
      };
      this.fetchGroupList(1);
    },

    /**
     * @description: 关闭Modal，清空分组查询栏
     * @author 13299
     */
    closeModal(){
      this.groupSearch = "";
    },

    /**
     * @description: 获取分页 group 列表（用于选择）
     * @author 13299
     */
    fetchGroupList(page = 1) {
      this.groupPageNo = page;
      this.groupLoading = true;
      this.$axios({
        url: this.$baseUrl + "/group/getPage",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: {
          pageSize: this.groupPageSize,
          pageNo: this.groupPageNo,
          keyword: this.groupSearch,
        },
      })
          .then((res) => {
            const { records, total } = res.data.data;
            this.groupList = records || [];
            this.groupTotal = total || 0;
          })
          .finally(() => {
            this.groupLoading = false;
          });
    },

    /**
     * @description: 修改用户信息
     * @author 13299
     */
    modify() {
      this.$axios({
        url: this.$baseUrl + "/user/modify",
        data: this.editUser,
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }).then((res) => {
        if (res.data.code === 0) {
          this.getPage();
        } else {
          this.warnText = `${res.data.code}: ${res.data.msg}`;
          this.$refs.warn.style.display = "flex";
          this.$refs.warn.style.animation = "fadeOut 2s ease both";
          setTimeout(this.alertInit, 2000, this.$refs.warn);
        }
      });
    },

    /**
     * @description: 新增用户
     * @author 13299
     */
    add() {
      this.$axios({
        url: this.$baseUrl + "/user/add",
        data: this.newUser,
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }).then((res) => {
        if (res.data.code === 0) {
          this.getPage();
          this.newUser.name = "";
        } else {
          this.warnText = `${res.data.code}: ${res.data.msg}`;
          this.$refs.warn.style.display = "flex";
          this.$refs.warn.style.animation = "fadeOut 2s ease both";
          setTimeout(this.alertInit, 2000, this.$refs.warn);
        }
      });
    },

    /**
     * @description: 删除用户
     * @author 13299
     */
    deleteUser() {
      this.$axios({
        url: this.$baseUrl + "/user/delete",
        params: { id: this.editUser.id },
        method: "POST",
      }).then((res) => {
        if (res.data.code === 0) {
          this.getPage();
        } else {
          this.warnText = `${res.data.code}: ${res.data.msg}`;
          this.$refs.warn.style.display = "flex";
          this.$refs.warn.style.animation = "fadeOut 2s ease both";
          setTimeout(this.alertInit, 2000, this.$refs.warn);
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
  },

  created() {
    this.getPage();
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
      <div class="card title"><i class="bi bi-person"></i>用户管理</div>
      <div class="card search-bar">
        <form class="d-flex" role="search">
          <input class="form-control me-3" placeholder="Search" v-model="searchInfo">
          <button class="btn btn-outline-success me-3" @click="getPage">搜索</button>
        </form>
        <button class="btn btn-outline-primary me-3" data-bs-toggle="modal" data-bs-target="#saveModal" @click="fetchGroupList(1)">新增</button>
        <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#filterModal" @click="fetchGroupList(1)">筛选</button>
      </div>
      <div class="card">
        <table class="table table-striped table-hover">
          <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">姓名</th>
            <th scope="col">所属分组</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in dataList" :key="item.id" data-bs-toggle="modal" data-bs-target="#editModal" @click="openEditModal(item)">
            <td>{{item.id}}</td>
            <td>{{item.name}}</td>
            <td>{{item.groupName}}</td>
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
            <button type="button" class="btn-close" data-bs-dismiss="modal" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="input-group modal-input">
              <span class="input-group-text">姓名</span>
              <input type="text" class="form-control" v-model="editUser.name">
            </div>
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
                <select class="form-select" v-model="editUser.groupId">
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">取消</button>
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="deleteUser">删除</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="modify">更新</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="saveModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">新增用户</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="input-group modal-input">
              <span class="input-group-text">姓名</span>
              <input type="text" class="form-control" v-model="newUser.name">
            </div>
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
                <select class="form-select" v-model="newUser.groupId">
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">取消</button>
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="add">保存</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="filterModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">根据分组筛选</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" @click="closeModal"></button>
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
                <select class="form-select" v-model="filter.groupId">
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

.title{
  font-size: 30px;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.search-bar{
  display: flex;
  flex-direction: row;
}

.pagination{
  display: flex;
  justify-content: center;
}

.page-item{
  cursor: pointer;
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
