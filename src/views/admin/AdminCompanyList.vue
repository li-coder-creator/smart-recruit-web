<template>

  <div class="admin-company-container">

    <!-- ========================= -->
    <!-- 页面标题 -->
    <!-- ========================= -->

    <div class="page-header">

      <h2>企业审核</h2>

    </div>


    <!-- ========================= -->
    <!-- 查询区域 -->
    <!-- ========================= -->

    <el-card class="search-card">

      <el-form
        :inline="true"
        :model="queryParams"
      >

        <el-form-item label="企业状态">

          <el-select
            v-model="queryParams.companyStatus"
            placeholder="全部状态"
            clearable
            style="width: 180px"
          >

            <el-option
              label="待审核"
              value="PENDING"
            />

            <el-option
              label="已通过"
              value="APPROVED"
            />

            <el-option
              label="已拒绝"
              value="REJECTED"
            />

          </el-select>

        </el-form-item>


        <el-form-item>

          <el-button
            type="primary"
            @click="handleSearch"
          >
            查询
          </el-button>

          <el-button
            @click="handleReset"
          >
            重置
          </el-button>

        </el-form-item>

      </el-form>

    </el-card>


    <!-- ========================= -->
    <!-- 企业列表 -->
    <!-- ========================= -->

    <el-card class="table-card">

      <el-table
        v-loading="loading"
        :data="companyList"
        border
        stripe
      >

        <el-table-column
          prop="id"
          label="企业ID"
          width="90"
        />

        <el-table-column
          prop="name"
          label="企业名称"
          min-width="180"
        />

        <el-table-column
          prop="city"
          label="城市"
          width="120"
        />

        <el-table-column
          prop="address"
          label="地址"
          min-width="200"
        />

        <el-table-column
          prop="status"
          label="状态"
          width="110"
        >

          <template #default="scope">

            <el-tag
              v-if="scope.row.status === 'PENDING'"
              type="warning"
            >
              待审核
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === 'APPROVED'"
              type="success"
            >
              已通过
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === 'REJECTED'"
              type="danger"
            >
              已拒绝
            </el-tag>

            <span v-else>
              {{ scope.row.status }}
            </span>

          </template>

        </el-table-column>


        <el-table-column
          label="操作"
          width="260"
          fixed="right"
        >

          <template #default="scope">

            <el-button
              type="primary"
              link
              @click="handleDetail(scope.row.id)"
            >
              查看详情
            </el-button>


            <el-button
              v-if="scope.row.status === 'PENDING'"
              type="success"
              link
              @click="handleApprove(scope.row)"
            >
              通过
            </el-button>


            <el-button
              v-if="scope.row.status === 'PENDING'"
              type="danger"
              link
              @click="handleReject(scope.row)"
            >
              拒绝
            </el-button>

          </template>

        </el-table-column>

      </el-table>


      <!-- ========================= -->
      <!-- 分页 -->
      <!-- ========================= -->

      <div class="pagination">

        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadCompanyList"
          @size-change="handleSizeChange"
        />

      </div>

    </el-card>


    <!-- ========================= -->
    <!-- 企业详情 -->
    <!-- ========================= -->

    <el-dialog
      v-model="detailVisible"
      title="企业详情"
      width="600px"
    >

      <el-descriptions
        v-if="currentCompany"
        :column="1"
        border
      >

        <el-descriptions-item label="企业ID">
          {{ currentCompany.id }}
        </el-descriptions-item>

        <el-descriptions-item label="用户ID">
          {{ currentCompany.userId }}
        </el-descriptions-item>

        <el-descriptions-item label="企业名称">
          {{ currentCompany.name }}
        </el-descriptions-item>

        <el-descriptions-item label="企业简介">
          {{ currentCompany.description || '暂无' }}
        </el-descriptions-item>

        <el-descriptions-item label="城市">
          {{ currentCompany.city || '暂无' }}
        </el-descriptions-item>

        <el-descriptions-item label="地址">
          {{ currentCompany.address || '暂无' }}
        </el-descriptions-item>

        <el-descriptions-item label="状态">
          {{ statusText(currentCompany.status) }}
        </el-descriptions-item>

        <el-descriptions-item label="创建时间">
          {{ currentCompany.createTime || '暂无' }}
        </el-descriptions-item>

        <el-descriptions-item label="更新时间">
          {{ currentCompany.updateTime || '暂无' }}
        </el-descriptions-item>

      </el-descriptions>


      <template #footer>

        <el-button
          @click="detailVisible = false"
        >
          关闭
        </el-button>

      </template>

    </el-dialog>

  </div>

</template>


<script setup>

import {
  onMounted,
  reactive,
  ref
} from 'vue'

import {
  ElMessage,
  ElMessageBox
} from 'element-plus'

import {
  getAdminCompanyList,
  getAdminCompanyDetail,
  approveCompany,
  rejectCompany
} from '@/api/admin'


// =========================
// 查询参数
// =========================

const queryParams = reactive({

  page: 1,

  pageSize: 10,

  companyStatus: ''

})


// =========================
// 企业列表
// =========================

const companyList = ref([])

const total = ref(0)

const loading = ref(false)


// =========================
// 企业详情
// =========================

const detailVisible = ref(false)

const currentCompany = ref(null)


// =========================
// 查询企业列表
// =========================

const loadCompanyList = async () => {

  loading.value = true

  try {

    const params = {

      page: queryParams.page,

      pageSize: queryParams.pageSize

    }


    // 只有选择状态时才发送参数
    if (queryParams.companyStatus) {

      params.companyStatus = queryParams.companyStatus

    }


    const res = await getAdminCompanyList(params)


    if (res.data.code !== 200) {

      ElMessage.error(
        res.data.message || '查询企业列表失败'
      )

      return

    }


    const pageResult = res.data.data

    companyList.value = pageResult.items || []

    total.value = pageResult.total || 0

  } catch (error) {

    console.error(
      '查询企业列表失败：',
      error
    )

    ElMessage.error('查询企业列表失败')

  } finally {

    loading.value = false

  }

}


// =========================
// 查询
// =========================

const handleSearch = () => {

  queryParams.page = 1

  loadCompanyList()

}


// =========================
// 重置
// =========================

const handleReset = () => {

  queryParams.companyStatus = ''

  queryParams.page = 1

  queryParams.pageSize = 10

  loadCompanyList()

}


// =========================
// 修改每页数量
// =========================

const handleSizeChange = () => {

  queryParams.page = 1

  loadCompanyList()

}


// =========================
// 查看详情
// =========================

const handleDetail = async (id) => {

  try {

    const res = await getAdminCompanyDetail(id)


    if (res.data.code !== 200) {

      ElMessage.error(
        res.data.message || '获取企业详情失败'
      )

      return

    }


    currentCompany.value = res.data.data

    detailVisible.value = true

  } catch (error) {

    console.error(
      '获取企业详情失败：',
      error
    )

    ElMessage.error('获取企业详情失败')

  }

}


// =========================
// 审核通过
// =========================

const handleApprove = async (company) => {

  try {

    await ElMessageBox.confirm(
      `确定通过企业「${company.name}」的审核吗？`,
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await approveCompany(company.id)


    if (res.data.code !== 200) {

      ElMessage.error(
        res.data.message || '审核通过失败'
      )

      return

    }


    ElMessage.success('审核通过')

    await loadCompanyList()

  } catch (error) {

    // 用户点击取消时不提示错误
    if (error !== 'cancel') {

      console.error(
        '企业审核通过失败：',
        error
      )

      ElMessage.error('审核操作失败')

    }

  }

}


// =========================
// 审核拒绝
// =========================

const handleReject = async (company) => {

  try {

    await ElMessageBox.confirm(
      `确定拒绝企业「${company.name}」的审核吗？`,
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await rejectCompany(company.id)


    if (res.data.code !== 200) {

      ElMessage.error(
        res.data.message || '审核拒绝失败'
      )

      return

    }


    ElMessage.success('已拒绝企业')

    await loadCompanyList()

  } catch (error) {

    if (error !== 'cancel') {

      console.error(
        '企业审核拒绝失败：',
        error
      )

      ElMessage.error('审核操作失败')

    }

  }

}


// =========================
// 状态文字
// =========================

const statusText = (status) => {

  const statusMap = {

    PENDING: '待审核',

    APPROVED: '已通过',

    REJECTED: '已拒绝'

  }

  return statusMap[status] || status || '未知'

}


// =========================
// 页面初始化
// =========================

onMounted(() => {

  loadCompanyList()

})

</script>


<style scoped>

.admin-company-container {

  padding: 20px;

}


.page-header {

  margin-bottom: 20px;

}


.page-header h2 {

  margin: 0;

}


.search-card {

  margin-bottom: 20px;

}


.table-card {

  margin-bottom: 20px;

}


.pagination {

  display: flex;

  justify-content: flex-end;

  margin-top: 20px;

}

</style>