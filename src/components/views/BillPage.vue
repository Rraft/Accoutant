<script>
import SideBar from "@/components/common/SideBar.vue";
import {deepClone, showWarn} from "@/utils/common.js";

export default {
  name: "BillPage",
  components: { SideBar },

  data() {
    return {
      warnText: "",
      currentGroup: { id: null, name: "" },
      modalGroup: { id: null, name: "" },
      currentMonth: "",
      modalMonth: "",
      result: {
        consumers: null,
        transfers: null,
      },
      // 组选择相关（用于编辑弹窗）
      groupList: [],
      groupSearch: "",
      groupPageNo: 1,
      groupPageSize: 10,
      groupTotal: 0,
    };
  },

  methods: {
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
     * @description: 打开Modal，存储原分组
     * @author 13299
     */
    openModal() {
      this.modalGroup = deepClone(this.currentGroup);
      this.modalMonth = this.currentMonth;
      this.groupSearch = "";
      this.fetchGroupList(1);
    },

    /**
     * @description: 更换分组
     * @author 13299
     */
    doFilter() {
      this.currentGroup = this.modalGroup;
      this.currentMonth = this.modalMonth;

      this.getResult();
    },

    /**
     * @description: 获取月度结算结果
     * @author 13299
     */
    getResult(){
      // 校验必填字段
      if (!this.currentGroup) {
        this.warnText = "分组为空";
      } else if (!this.currentMonth) {
        this.warnText = "月份为空";
      } else {
        this.warnText = "";
      }

      // 如果有警告内容就显示提示并中断发送
      if (this.warnText) {
        showWarn(this, this.warnText)
        return;
      }

      this.$axios({
        url: this.$baseUrl + "/receipt/getMonthResult",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: {
          month: this.currentMonth,
          groupId: this.currentGroup.id,
        }
      }).then(res => {
        if (res.data.code === 0) {
          const data = res.data.data;
          this.result.consumers = data.consumers;
          this.result.transfers = data.transfers;
        } else {
          this.warnText = `${res.data.code}: ${res.data.msg}`;
          showWarn(this, this.warnText)
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
        <i class="bi bi-person-bounding-box"></i>
        <span class="me-3">月度结算</span>
        <div class="input-group modal-input">
          <span class="input-group-text">当前年月</span>
          <input type="text" class="form-control length-limited-input" readonly v-model="currentMonth">
        </div>
        <div class="input-group modal-input">
          <span class="input-group-text">当前分组</span>
          <input type="text" class="form-control length-limited-input" readonly v-model="currentGroup.name">
        </div>
        <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#filterModal" @click="openModal">选择</button>
      </div>
      <div v-if="result.consumers != null" class="card">
        <h5 class="mb-3">
          <i class="bi bi-person-lines-fill me-2"></i>个人收支
        </h5><table class="table table-striped table-hover">
        <thead>
        <tr>
          <th v-for="consumer in result.consumers" :key="consumer.name" scope="col">
            {{ consumer.name }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td v-for="consumer in result.consumers" :key="consumer.name">
            {{ consumer.amount }}
          </td>
        </tr>
        </tbody>
      </table>
      </div>
      <div v-if="result.transfers != null" class="card">
        <h5 class="mb-3"><i class="bi bi-arrow-left-right me-2"></i>转账建议</h5>
        <div v-for="(transfer, index) in result.transfers" :key="index" class="mb-3 shadow-sm">
          <div class="card-header bg-success text-white fw-bold">
            收款者：{{ transfer.takeOut.name }}
          </div>
          <ul class="list-group list-group-flush">
            <li v-for="(payer, idx) in transfer.putIn" :key="idx" class="list-group-item d-flex justify-content-between align-items-center">
              <span>{{ payer.name }}</span>
              <span class="fw-bold text-primary">￥{{ payer.amount.toFixed(2) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="modal fade" id="filterModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">选择</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="input-group modal-input">
              <span class="input-group-text">选择月份</span>
              <input type="month" class="form-control" v-model="modalMonth"/>
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
                <select class="form-select" v-model="modalGroup">
                  <option disabled>请选择分组</option>
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
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="doFilter">确认</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>