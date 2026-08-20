<template>

  <div class="admin-user-container">

    <!-- ========================= -->
    <!-- 页面标题 -->
    <!-- ========================= -->

    <div class="page-header">

      <h2>用户管理</h2>

    </div>


    <!-- ========================= -->
    <!-- 查询区域 -->
    <!-- ========================= -->

    <el-card class="search-card">

      <el-form
        :inline="true"
        :model="queryParams"
      >

        <el-form-item label="用户角色">

          <el-select
            v-model="queryParams.userRole"
            placeholder="全部角色"
            clearable
            style="width: 180px"
          >

            <el-option
              label="求职者"
              value="JOB_SEEKER"
            />

            <el-option
              label="企业"
              value="COMPANY"
            />

            <el-option
              label="管理员"
              value="ADMIN"
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
    <!-- 用户列表 -->
    <!-- ========================= -->

    <el-card class="table-card">

      <el-table
        v-loading="loading"
        :data="userList"
        border
        stripe
      >

        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />

        <el-table-column
          prop="username"
          label="用户名"
          min-width="150"
        />

        <el-table-column
          prop="role"
          label="角色"
          width="120"
        >

          <template #default="scope">

            <el-tag
              v-if="scope.row.role === 'JOB_SEEKER'"
              type="primary"
            >
              求职者
            </el-tag>

            <el-tag
              v-else-if="scope.row.role === 'COMPANY'"
              type="success"
            >
              企业
            </el-tag>

            <el-tag
              v-else-if="scope.row.role === 'ADMIN'"
              type="danger"
            >
              管理员
            </el-tag>

            <span v-else>
              {{ scope.row.role }}
            </span>

          </template>

        </el-table-column>


        <!--
          暂时不展示 password 等敏感字段。
        -->

        <el-table-column
          label="操作"
          width="120"
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
          @current-change="loadUserList"
          @size-change="handleSizeChange"
        />

      </div>

    </el-card>


    <!-- ========================= -->
    <!-- 用户详情 -->
    <!-- ========================= -->

    <el-dialog
      v-model="detailVisible"
      title="用户详情"
      width="500px"
    >

      <el-descriptions
        v-if="currentUser"
        :column="1"
        border
      >

        <el-descriptions-item label="用户ID">
          {{ currentUser.id }}
        </el-descriptions-item>

        <el-descriptions-item label="用户名">
          {{ currentUser.username }}
        </el-descriptions-item>

        <el-descriptions-item label="角色">
          {{ roleText(currentUser.role) }}
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
  ElMessage
} from 'element-plus'

import {
  getAdminUserList,
  getAdminUserDetail
} from '@/api/admin'


// =========================
// 查询参数
// =========================

const queryParams = reactive({

  page: 1,

  pageSize: 10,

  userRole: ''

})


// =========================
// 用户列表
// =========================

const userList = ref([])

const total = ref(0)

const loading = ref(false)


// =========================
// 用户详情
// =========================

const detailVisible = ref(false)

const currentUser = ref(null)


// =========================
// 查询用户列表
// =========================

const loadUserList = async () => {

  loading.value = true

  try {

    const params = {

      page: queryParams.page,

      pageSize: queryParams.pageSize

    }


    // 只有选择角色时才发送 userRole
    if (queryParams.userRole) {

      params.userRole = queryParams.userRole

    }


    const res = await getAdminUserList(params)


    if (res.data.code !== 200) {

      ElMessage.error(
        res.data.message || '查询用户失败'
      )

      return

    }


    // 后端：
    // Result<PageResult<User>>
    //
    // PageResult：
    // total
    // items

    const pageResult = res.data.data

    userList.value = pageResult.items || []

    total.value = pageResult.total || 0

  } catch (error) {

    console.error(
      '查询用户列表失败：',
      error
    )

    ElMessage.error('查询用户列表失败')

  } finally {

    loading.value = false

  }

}


// =========================
// 查询
// =========================

const handleSearch = () => {

  queryParams.page = 1

  loadUserList()

}


// =========================
// 重置
// =========================

const handleReset = () => {

  queryParams.userRole = ''

  queryParams.page = 1

  queryParams.pageSize = 10

  loadUserList()

}


// =========================
// 修改每页数量
// =========================

const handleSizeChange = () => {

  queryParams.page = 1

  loadUserList()

}


// =========================
// 查看用户详情
// =========================

const handleDetail = async (id) => {

  try {

    const res = await getAdminUserDetail(id)


    if (res.data.code !== 200) {

      ElMessage.error(
        res.data.message || '获取用户详情失败'
      )

      return

    }


    currentUser.value = res.data.data

    detailVisible.value = true

  } catch (error) {

    console.error(
      '获取用户详情失败：',
      error
    )

    ElMessage.error('获取用户详情失败')

  }

}


// =========================
// 角色文字
// =========================

const roleText = (role) => {

  const roleMap = {

    JOB_SEEKER: '求职者',

    COMPANY: '企业',

    ADMIN: '管理员'

  }

  return roleMap[role] || role || '未知'

}


// =========================
// 页面初始化
// =========================

onMounted(() => {

  loadUserList()

})

</script>


<style scoped>

.admin-user-container {

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