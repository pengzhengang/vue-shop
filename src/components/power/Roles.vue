<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1 ===0 ?'bdtop':'','vcenter']"
              v-for="(item1,i1) of scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二、三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0?'':'bdtop','vcenter']"
                  v-for="(item2,i2) of item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) of item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
                {{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName" label-width="80px">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      //所有权限的数据
      rightslist: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      //默认选中节点id值数组
      defKeys: [],
      //即将分配权限的角色id
      roleId: "",
      //控制添加角色对话框的显示隐藏
      addDialogVisible: false,
      //添加角色的表单数据
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      //添加表单验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "角色名称的长度在1~10个字符之间",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "角色描述的长度在3~15个字符之间",
            trigger: "blur"
          }
        ]
      },
      //控制修改角色对话框的显示隐藏
      editDialogVisible:false,
      //查询到的用户信息对象
      editForm: {},
      //修改表单的验证规则对象
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "角色描述的长度在3~15个字符之间",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "角色描述的长度在3~15个字符之间",
            trigger: "blur"
          }
        ]
      },
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.axios.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取列表失败!");
      }
      this.rolelist = res.data;
    },
    //根据Id删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除!");
      }
      const { data: res } = await this.axios.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败!");
      }

      //防止删除权限后下拉三角直接合上
      role.children = res.data;

      //   this.getRolesList()
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      //获取所有权限数据
      const { data: res } = await this.axios.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败!");
      }
      //把获取到的权限数据保存到data中
      this.rightslist = res.data;
      console.log(this.rightslist);
      //递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);

      this.setRightDialogVisible = true;
    },
    //通过递归的形式,获取角色下所有三级权限的id,并保存到defKeys数组中
    getLeafKeys(node, arr) {
      //如果当前节点不包含children属性,则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    //点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(",");

      const { data: res } = await this.axios.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败!");
      }
      this.$message.success("分配权限成功!");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
    //监听用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //添加角色
    addRole() {
      //表单预校验操作
      // this.$refs.addFormRef.validate(valid=>{
      //   console.log(valid)
      // })
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        //发起添加用户的网络请求
        const { data: res } = await this.axios.post("roles", this.addForm);
        if (res.meta.status !== 200) {
          this.$message.error("添加角色失败!");
        }
        this.$message.success("添加角色成功!");
        //隐藏添加角色的对话框
        this.addDialogVisible = false;
        //重新获取角色列表数据
        this.getRolesList();
      });
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.axios.get("roles/" + id);
      if (res.meta.status == !200) {
        return this.$message.error("查询角色信息失败");
      }
      this.editForm = res.data;
    },
    //监听修改角色对话框的关闭事件
    editDialogClosed(){
      this.$refs.editFormRef.resetFields();
    },
    //修改用户信息并提交
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        //发起修改用户信息请求
        const { data: res } = await this.axios.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("编辑角色信息失败!");
        }
        //关闭对话框
        this.editDialogVisible = false;
        //舒心数据列表
        this.getRolesList();
        //提示修改成功
        this.$message.success("编辑角色信息成功!");
      });
    },
    //根据Id删除对应的用户信息
    async removeRoleById(id) {
      //弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //如果用户确认删除,则返回为字符串 confirm
      //如果用户取消了删除,则返回cancel字符串
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.axios.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败!");
      }
      this.$message.success("删除角色成功!");
      this.getRolesList();
    },
  }
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>