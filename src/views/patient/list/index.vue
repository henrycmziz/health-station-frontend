<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--类型数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="typeName"
            placeholder="请输入类型名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="typeOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--患者数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="患者姓名" prop="userName">
            <el-input
              v-model="queryParams.nickName"
              placeholder="请输入患者姓名"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="请输入手机号码"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="患者状态"
              clearable
              size="small"
              style="width: 240px"
            >
              <el-option
                v-for="dict in dict.type.sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['patient:info:add']"
            >新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['patient:info:edit']"
            >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['patient:info:remove']"
            >删除
            </el-button>
          </el-col>
          <!--          <el-col :span="1.5">
                      <el-button
                        type="info"
                        plain
                        icon="el-icon-upload2"
                        size="mini"
                        @click="handleImport"
                        v-hasPermi="['patient:info:import']"
                      >导入
                      </el-button>
                    </el-col>
                    <el-col :span="1.5">
                      <el-button
                        type="warning"
                        plain
                        icon="el-icon-download"
                        size="mini"
                        @click="handleExport"
                        v-hasPermi="['patient:info:export']"
                      >导出
                      </el-button>
                    </el-col>-->
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column label="序号" type="index" width="50" align="center" v-if="columns[0].visible">
            <template slot-scope="scope">
              <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <!--          <el-table-column label="患者用户名" align="center" key="userName" prop="userName" v-if="columns[1].visible"-->
          <!--                           :show-overflow-tooltip="true"/>-->
          <el-table-column label="患者姓名" align="center" key="nickName" prop="nickName" v-if="columns[1].visible"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber" v-if="columns[2].visible"
                           width="120"/>
          <el-table-column label="患者类型" align="center" key="typeName" prop="type.typeName" v-if="columns[3].visible"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="激活状态" align="center" key="isActive" v-if="columns[4].visible">
            <template v-slot="scope">
              <el-tag :type="scope.row.isActive=== 0 ? 'primary' : 'success'">
                {{ scope.row.isActive === 0 ? '未激活' : '已激活' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="打卡状态" align="center" key="isClockIn" v-if="columns[5].visible">
            <template v-slot="scope">
              <el-tag :type="scope.row.isClockIn=== 0 ? 'primary' : 'success'">
                <em :class="scope.row.isClockIn === 1? 'el-icon-loading':''"/>
                {{ scope.row.isClockIn === 0 ? '无任务' : '打卡中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" key="status" v-if="columns[6].visible">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[7].visible" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="180"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope" v-if="scope.row.userId !== 1">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="openClockInListDrawer(scope.row)"
                v-hasPermi="['patient:clockin:list']"
              >打卡记录
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['patient:info:edit']"
              >修改
              </el-button>
              <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)"
                           v-hasPermi="['patient:info:resetPwd', 'patient:info:remove']">
                <span class="el-dropdown-link">
                  <i class="el-icon-d-arrow-right el-icon--right"></i>更多
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="handleResetPwd" icon="el-icon-key"
                                    v-hasPermi="['patient:info:resetPwd']">重置密码
                  </el-dropdown-item>
                  <el-dropdown-item command="handleDelete" icon="el-icon-delete"
                                    v-hasPermi="['patient:info:remove']">删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <el-drawer :visible.sync="clockInDrawer.openDrawer" size="48%" append-to-body>
      <template v-slot:title>
        <div>
          <span style="margin-right: 60px">{{ clockInDrawer.pName }}</span>
          <el-button type="primary" size="small" @click.native="openCreateClockInPlanDialog"
                     :disabled="clockInDrawer.canCreatePlan"
                     icon="el-icon-plus">新增打卡计划
          </el-button>
        </div>
      </template>
      <div style="padding: 0 15px;height: 100%;width: 100%">
        <el-scrollbar style="height: 100%;">
          <el-table
            :data="clockInDrawer.clockInHistoryData"
            ref="outerLayerTable"
            @row-click="handleRowClick"
            :header-cell-style="{background:'#e6e6e6',color:'#606266'}">
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-table :data="scope.row['clockInDetails']"
                          :default-sort="{prop: 'clock_in_time', order: 'descending'}"
                          :header-cell-style="{background:'#e6e6e6',color:'#606266'}">
                  <el-table-column prop="clockInTime" label="应打卡日期" sortable width="120"/>
                  <el-table-column prop="isClockedIn" label="是否打卡" sortable width="120">
                    <template v-slot="scope">
                      <el-tag :type="scope.row['isClockedIn'] === 0 ? 'info':'success'" size="mini">
                        {{ scope.row['isClockedIn'] === 0 ? '未打卡' : '已打卡' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="submitTime" label="提交日期">
                    <template v-slot="scope">
                      {{ scope.row.submitTime }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="comment" label="评论" :show-overflow-tooltip="true"/>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column prop="modelName" label="康复模型"></el-table-column>
            <el-table-column prop="startTime" label="开始日期"></el-table-column>
            <el-table-column prop="endTime" label="结束日期"></el-table-column>
            <el-table-column prop="remark" label="打卡说明" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="createBy" label="创建人"></el-table-column>
            <el-table-column prop="completionRate" label="打卡率"></el-table-column>
          </el-table>
        </el-scrollbar>
      </div>
    </el-drawer>

    <el-dialog :title="'为 ' + clockInDrawer.pName + ' 创建打卡计划'" :visible.sync="createClockInPlan.openDialog"
               @close="cancelCreateClockInForm"
               append-to-body>
      <el-form ref="createClockInPlan.form" :model="createClockInPlan.form" :rules="createClockInPlan.rules"
               label-width="80px">
        <el-row>
          <el-form-item label="康复模型" prop="modelId">
            <el-select
              v-model="createClockInPlan.form.modelId"
              placeholder="请选择康复模型"
              clearable
              size="small"
            >
              <el-option v-for="(item, index) in modelOptions" :key="index" :label="item.value" :value="item.key"/>
            </el-select>
          </el-form-item>
          <el-form-item label="打卡时间" prop="dateRange">
            <el-date-picker
              v-model="createClockInPlan.form.dateRange"
              type="daterange"
              align="right"
              unlink-panels
              value-format="yyyy-MM-dd"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="createClockInPlan.pickerOptions">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="打卡说明" prop="remark">
            <el-input v-model="createClockInPlan.form.remark" placeholder="请输入打卡说明" type="textarea"/>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelCreateClockInForm">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitCreateClockInPlanForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改患者配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="患者姓名" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入患者姓名" maxlength="30" @input="genUserName"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="登录账号" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入登录账号" maxlength="30"
                        :disabled="form.userId !== undefined"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId === undefined" label="登录密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入登录密码" type="password" maxlength="20" show-password/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="归属类型" prop="deptId">
              <treeselect v-model="form.typeId" :options="typeOptions" :show-count="true" placeholder="请选择归属类型"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="患者性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                  v-for="dict in dict.type.sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="诊断">
              <el-input v-model="form.diagnosis" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 患者导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport"/>
            是否更新已经存在的患者数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                   @click="importTemplate">下载模板
          </el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listPatient,
  getPatient,
  delPatient,
  addPatient,
  updatePatient,
  resetPatientPwd,
  changePatientStatus
} from "@/api/business/patient/info";
import {getToken} from "@/utils/auth";
import {treeselect} from "@/api/business/patient/type";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {pinyin} from 'pinyin-pro';
import {addPlan, clockInHistory, getClockIn} from "@/api/business/patient/clockin";
import {listModel} from "@/api/business/resource/model";

export default {
  name: "User",
  dicts: ['sys_normal_disable', 'sys_user_sex'],
  components: {Treeselect},
  data() {
    return {
      pinyin: undefined,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 患者表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 类型树选项
      typeOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 类型名称
      typeName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 模型选项
      modelOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 患者导入参数
      upload: {
        // 是否显示弹出层（患者导入）
        open: false,
        // 弹出层标题（患者导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的患者数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {Authorization: "Bearer " + getToken()},
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/user/importData"
      },
      clockInDrawer: {
        pid: null,
        pName: '',
        canCreatePlan: false,
        openDrawer: false,
        clockInHistoryData: []
      },
      createClockInPlan: {
        openDialog: false,
        form: {},
        rules: {
          modelId: [
            {required: true, message: "运动模型为必选项", trigger: "blur"}
          ],
          dateRange: [
            {
              required: true,
              message: "请选择打卡时长",
              trigger: "blur"
            }
          ]
        },
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() < Date.now() - 8.64e7;
          },
          shortcuts: [{
            text: '往后一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '往后两周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 14);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '往后一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        typeId: undefined
      },
      // 列信息
      columns: [
        {key: 0, label: `序号`, visible: true},
        {key: 1, label: `患者姓名`, visible: true},
        {key: 2, label: `手机号码`, visible: true},
        {key: 3, label: `患者类型`, visible: true},
        {key: 4, label: `激活状态`, visible: true},
        {key: 5, label: `打卡状态`, visible: true},
        {key: 6, label: `状态`, visible: true},
        {key: 7, label: `创建时间`, visible: false}
      ],
      // 表单校验
      rules: {
        userName: [
          {required: true, message: "患者名称不能为空", trigger: "blur"},
          {min: 2, max: 20, message: '患者名称长度必须介于 2 和 20 之间', trigger: 'blur'}
        ],
        nickName: [
          {required: true, message: "患者姓名不能为空", trigger: "blur"}
        ],
        phonenumber: [
          {
            required: true,
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        password: [
          {required: true, message: "患者密码不能为空", trigger: "blur"},
          {min: 5, max: 20, message: '患者密码长度必须介于 5 和 20 之间', trigger: 'blur'}
        ],
        email: [
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  watch: {
    // 根据名称筛选类型树
    typeName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getConfigKey("sys.patient.initPassword").then(response => {
      this.initPassword = response.msg;
    });
  },
  methods: {
    openClockInListDrawer(row) {
      this.clockInDrawer.pid = row.userId
      this.clockInDrawer.pName = row.nickName
      this.clockInDrawer.canCreatePlan = row.isClockIn === 1
      clockInHistory(row.userId).then(res => {
        this.clockInDrawer.clockInHistoryData = res.data
      })
      this.clockInDrawer.openDrawer = true
    },
    handleRowClick(row) {
      row.expanded = !row.expanded;
      this.$refs.outerLayerTable.toggleRowExpansion(row, row.expanded);
    },
    openCreateClockInPlanDialog() {
      this.createClockInPlan.form.patientId = this.clockInDrawer.pid
      this.createClockInPlan.openDialog = true
      listModel({modelStatus: 1}).then(res => {
        this.modelOptions = res.rows.map(item => {
          return {key: item.id, value: item.modelName}
        })
      })
    },
    submitCreateClockInPlanForm() {
      if (null != this.createClockInPlan.form.dateRange && '' !== this.createClockInPlan.form.dateRange) {
        this.createClockInPlan.form["startTime"] = this.createClockInPlan.form.dateRange[0];
        this.createClockInPlan.form["endTime"] = this.createClockInPlan.form.dateRange[1];
      }
      this.$refs["createClockInPlan.form"].validate(valid => {
        if (valid)
          addPlan(this.createClockInPlan.form).then((() => {
            this.$modal.msgSuccess('为患者 ' + this.clockInDrawer.pName + ' 新增打卡计划成功')
            this.createClockInPlan.openDialog = false
            this.clockInDrawer.openDrawer = false
            this.getList()
          }))
      })
    },
    // 取消按钮
    cancelCreateClockInForm() {
      this.createClockInPlan.openDialog = false;
      this.createClockInFormReset();
    },
    // 表单重置
    createClockInFormReset() {
      this.createClockInPlan.form = {
        patientId: this.clockInDrawer.pid,
        modelId: undefined,
        startTime: undefined,
        endTime: undefined,
        remark: ''
      };
      this.resetForm("createClockInPlan.form");
    },
    genUserName(name) {
      if (name !== undefined && this.title === "添加患者")
        this.form.userName = pinyin(name, {toneType: 'none', mode: 'surname'}).split(" ").join("")
    },
    /** 查询患者列表 */
    getList() {
      this.loading = true;
      listPatient(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 查询类型下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.typeOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.typeId = data.id;
      this.getList();
    },
    // 患者状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要 "' + text + '" "' + row.userName + '" 患者吗？').then(function () {
        return changePatientStatus(row.userId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        diagnosis: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleResetPwd":
          this.handleResetPwd(row);
          break;
        case "handleDelete":
          this.handleDelete(row);
          break;
        default:
          break;
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.getTreeselect();
      this.open = true;
      this.title = "添加患者";
      this.form.password = this.initPassword;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const userId = row.userId || this.ids;
      getPatient(userId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改患者";
        this.form.password = "";
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "患者密码长度必须介于 5 和 20 之间"
      }).then(({value}) => {
        resetPatientPwd(row.userId, value).then(response => {
          this.$modal.msgSuccess("修改成功，新密码是：" + value);
        });
      }).catch(() => {
      });
    },
    /** 分配角色操作 */
    handleAuthRole: function (row) {
      const userId = row.userId;
      this.$router.push("/system/user-auth/role/" + userId);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.userId !== undefined) {
            updatePatient(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPatient(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const patientIds = row.userId || this.ids;
      this.$modal.confirm('是否确认删除患者编号为"' + patientIds + '"的数据项？').then(function () {
        return delPatient(patientIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('patient/export', {
        ...this.queryParams
      }, `user_${new Date().getTime()}.xlsx`)
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "患者导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download('patient/importTemplate', {}, `patient_template_${new Date().getTime()}.xlsx`)
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", {dangerouslyUseHTMLString: true});
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    }
  }
};
</script>
<style>
.el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
