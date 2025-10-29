<script>
import SideBar from "@/components/common/SideBar.vue";

export default {
  name: "GroupPage",

  components: {SideBar},

  data(){
    return{
      searchInfo: "",
      warnText: "",
      dataList: [],
      rows: 1, //总页数，十条一页
      row: 1, //当前所在页码，展示至多9个页码
      leftRow: 0, //翻页条左界
      rightRow: 0, //翻页条右界
      editGroup: {
        id: 0,
        name: "",
        description: "",
      },
      newGroup: {
        name: "",
        description: "",
      },
    }
  },

  methods: {
    /**
     * @description: 复位警告栏
     * @author 13299
     */
    alertInit(a){
      a.style.display = "none";
      a.style.animation = "none";
    },

    /**
     * @description: 获取所有记录
     * @author 13299
     */
    getPage(){
      this.$axios({
        url: this.$baseUrl + "/group/getPage",
        data: {
          pageSize: 20,
          pageNo: this.row,
          keyword: this.searchInfo,
        },
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        }
      }).then(res => {
        const data = res.data.data;
        this.dataList = data.records;
        this.rows = Math.ceil(data.total / 10);
        this.rightRow = Math.min(this.rows, 9);
      });
    },

    /**
     * @description: 打开modal时触发
     * @author 13299
     */
    openEditModal(item){
      this.editGroup = {
        id: item.id,
        name: item.name,
        description: item.description,
      }
    },

    /**
     * @description: 修改分组信息
     * @author 13299
     */
    modify(){
      this.$axios({
        url: this.$baseUrl + "/group/modify",
        data: this.editGroup,
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        }
      }).then(res => {
        if (res.data.code === 0){
          this.getPage();

        }else {
          this.warnText = res.data.code + ":" + res.data.msg; //显示警告信息
          this.$refs.warn.style.display = "flex";  //弹出警告栏并慢慢消失
          this.$refs.warn.style.animation = "fadeOut 2s ease both";
          setTimeout(this.alertInit,2000, this.$refs.warn);
        }
      });
    },

    /**
     * @description: 新增group表记录
     * @author 13299
     */
    add(){
      this.$axios({
        url: this.$baseUrl + "/group/add",
        data: this.newGroup,
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        }
      }).then(res => {
        if (res.data.code === 0){
          this.getPage();

        }else {
          this.warnText = res.data.code + ":" + res.data.msg; //显示警告信息
          this.$refs.warn.style.display = "flex";  //弹出警告栏并慢慢消失
          this.$refs.warn.style.animation = "fadeOut 2s ease both";
          setTimeout(this.alertInit,2000, this.$refs.warn);
        }
      });
    },

    /**
     * @description: 删除group记录
     * @author 13299
     */
    deleteGroup(){
      this.$axios({
        url: this.$baseUrl + "/group/delete",
        params: {
          id: this.editGroup.id
        },
        method: "POST",
      }).then(res => {
        if (res.data.code === 0){
          this.getPage();

        }else {
          this.warnText = res.data.code + ":" + res.data.msg; //显示警告信息
          this.$refs.warn.style.display = "flex";  //弹出警告栏并慢慢消失
          this.$refs.warn.style.animation = "fadeOut 2s ease both";
          setTimeout(this.alertInit,2000, this.$refs.warn);
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
      this.getPage();
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
      this.getPage();
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
      this.getPage();
    },
  },

  created(){
    this.getPage();
  },

  computed: {
    /**
     * @description: 根据rows属性迭代出页码列表
     * @author 13299
     */
    generatedRows(){
      return Array.from({ length: this.rows }, (_, index) => ({ id: index + 1 }));
    },
  }
}
</script>

<template>

  <div class="outer">
    <div class="alert alert-danger" role="alert" ref="warn">
      {{ warnText }}
    </div>
    <side-bar></side-bar>
    <div class="card panel">
      <div class="card title"><i class="bi bi-person"></i>分组管理</div>
      <div class="card search-bar">
        <form class="d-flex" role="search">
          <input class="form-control me-3" placeholder="搜索栏" v-model="searchInfo">
          <button type="button" class="btn btn-outline-success me-3" @click="getPage">搜索</button>
        </form>
        <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#saveModal">新增</button>
      </div>
      <div class="card">
        <table class="table table-striped table-hover">
          <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">组名</th>
            <th scope="col">描述</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in dataList" :key="item.id" data-bs-toggle="modal" data-bs-target="#editModal" @click="openEditModal(item)">
            <td>{{item.id}}</td>
            <td>{{item.name}}</td>
            <td>{{item.description}}</td>
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
              <span class="input-group-text">组名</span>
              <input type="text" class="form-control" v-model="editGroup.name">
            </div>
            <div class="input-group modal-input">
              <span class="input-group-text">描述</span>
              <textarea type="text" class="form-control" v-model="editGroup.description"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="deleteGroup">删除</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="modify">更新</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="saveModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">新增分组</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="input-group modal-input">
              <span class="input-group-text">组名</span>
              <input type="text" class="form-control" v-model="newGroup.name">
            </div>
            <div class="input-group modal-input">
              <span class="input-group-text">描述</span>
              <textarea type="text" class="form-control" v-model="newGroup.description"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="add">保存</button>
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