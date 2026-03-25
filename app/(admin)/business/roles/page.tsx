"use client";

import React, { Fragment, useState, useMemo, useEffect } from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { Container, SelectAltInput } from '@/components/ui'
import { SearchIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import { AdminsTable, PermissionsTable, RolesTable } from '@/components/ui/tables'
import { permissionsData } from '@/lib/data'
import StatCard from '@/components/sections/StatCards'
import Pagination from '@/components/ui/Pagination'
import Modals from '@/components/ui/dashboard/modals'
import { useAdminUsers } from '@/lib/hooks/admin/use-admin-users'
import { useRoles } from '@/lib/hooks/admin/use-roles'
import { useAdminStats } from '@/lib/hooks/admin/use-admin-stats'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const EmptyIcon = () => null;

const tableHeaders = [
  {
    label: "Admin Name",
    key: "name"
  },
  {
    label: "Email Address",
    key: "email"
  },
  {
    label: "Role",
    key: "role"
  },
  {
    label: "Status",
    key: "status"
  },
  {
    label: "Action",
    key: "action"
  }
]

const permissionsTableHeaders = [
  {
    label: "Permission Name",
    key: "name"
  },
  {
    label: "Status",
    key: "status"
  },
  {
    label: "Last Updated",
    key: "lastUpdated"
  },
  {
    label: "Actions",
    key: "actions"
  }
]

const rolesTableHeaders = [
  {
    label: "Role Name",
    key: "name"
  },
  {
    label: "Users",
    key: "users"
  },
  {
    label: "Permissions",
    key: "permissions"
  },
  {
    label: "Status",
    key: "status"
  },
  {
    label: "Actions",
    key: "actions"
  }
]

const tabs = [
  {
    name: "Admin users",
    key: "admin-users"
  },
  {
    name: "Roles",
    key: "roles"
  },
  // {
  //   name: "Permissions",
  //   key: "permissions"
  // }
]

const page = () => {
  const [isEmpty, setIsEmpty] = useState(false)
  const [activeTab, setActiveTab] = useState("admin-users")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false)
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  
  // Permissions tab state
  const [permissionsSearchQuery, setPermissionsSearchQuery] = useState("")
  const [permissionsCurrentPage, setPermissionsCurrentPage] = useState(1)
  const [permissionsItemsPerPage, setPermissionsItemsPerPage] = useState(10)
  const [showEditPermissionModal, setShowEditPermissionModal] = useState(false)
  const [showDisablePermissionModal, setShowDisablePermissionModal] = useState(false)
  const [showActivatePermissionModal, setShowActivatePermissionModal] = useState(false)
  const [showDeletePermissionModal, setShowDeletePermissionModal] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<any>(null)
  const [permissions, setPermissions] = useState(permissionsData)
  
  // Roles tab state
  const [rolesSearchQuery, setRolesSearchQuery] = useState("")
  const [rolesCurrentPage, setRolesCurrentPage] = useState(1)
  const [rolesItemsPerPage, setRolesItemsPerPage] = useState(10)
  const [showRoleDetailsModal, setShowRoleDetailsModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showDeactivateRoleModal, setShowDeactivateRoleModal] = useState(false)
  const [showActivateRoleModal, setShowActivateRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)

  // Fetch roles from API
  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles();
  
  // Fetch all admin users to count users per role
  const { data: allAdminUsersResponse } = useAdminUsers({
    page: 1,
    limit: 1000, // Get all users to count roles
  });
  
  // Transform roles data to match table structure
  const roles = useMemo(() => {
    if (!rolesResponse?.roles) return [];
    
    const adminUsers = allAdminUsersResponse?.users || [];
    
    return rolesResponse.roles.map(role => {
      // Count users with this role
      const usersCount = adminUsers.filter(user => user.role === role.name || user.role === role.id).length;
      
      // Count permissions from permissions object
      const permissionsCount = role.permissions 
        ? (typeof role.permissions === 'object' ? Object.keys(role.permissions).length : 0)
        : 0;
      
      return {
        id: role.id,
        name: role.name,
        users: usersCount,
        permissions: permissionsCount,
        status: "Active", // Default to Active, adjust if API provides status
      };
    });
  }, [rolesResponse, allAdminUsersResponse]);

  // Fetch admin stats from API
  const { data: adminStatsResponse, isLoading: isLoadingStats } = useAdminStats();

  // Map stats to StatCard format
  const stats = useMemo(() => {
    if (!adminStatsResponse?.stats) {
      return [
        {
          title: "Total Admins",
          emptyBalance: "0",
          nonEmptyBalance: "0",
          emptyPercentage: "0%",
          nonEmptyPercentage: "0%",
          direction: "progress",
          icon: EmptyIcon,
          showIcon: false,
          suffix: ""
        },
        {
          title: "Active Admins",
          emptyBalance: "0",
          nonEmptyBalance: "0",
          emptyPercentage: "0%",
          nonEmptyPercentage: "0%",
          direction: "progress",
          icon: EmptyIcon,
          showIcon: false,
          suffix: ""
        },
        {
          title: "Inactive Admins",
          emptyBalance: "0",
          nonEmptyBalance: "0",
          emptyPercentage: "0%",
          nonEmptyPercentage: "0%",
          direction: "decline",
          icon: EmptyIcon,
          showIcon: false,
          suffix: ""
        },
        {
          title: "Pending Invites",
          emptyBalance: "0",
          nonEmptyBalance: "0",
          emptyPercentage: "0%",
          nonEmptyPercentage: "0%",
          direction: "progress",
          icon: EmptyIcon,
          showIcon: false,
          suffix: ""
        }
      ];
    }

    const statsData = adminStatsResponse.stats;
    const formatChange = (change: number) => {
      const sign = change >= 0 ? "+" : "";
      return `${sign}${change}`;
    };

    return [
      {
        title: "Total Admins",
        emptyBalance: "0",
        nonEmptyBalance: statsData.totalAdmins?.count?.toString() || "0",
        emptyPercentage: "0%",
        nonEmptyPercentage: formatChange(statsData.totalAdmins?.change || 0),
        direction: (statsData.totalAdmins?.change || 0) >= 0 ? "progress" : "decline",
        icon: EmptyIcon,
        showIcon: false,
        suffix: ""
      },
      {
        title: "Active Admins",
        emptyBalance: "0",
        nonEmptyBalance: statsData.activeAdmins?.count?.toString() || "0",
        emptyPercentage: "0%",
        nonEmptyPercentage: formatChange(statsData.activeAdmins?.change || 0),
        direction: (statsData.activeAdmins?.change || 0) >= 0 ? "progress" : "decline",
        icon: EmptyIcon,
        showIcon: false,
        suffix: ""
      },
      {
        title: "Inactive Admins",
        emptyBalance: "0",
        nonEmptyBalance: statsData.inactiveAdmins?.count?.toString() || "0",
        emptyPercentage: "0%",
        nonEmptyPercentage: formatChange(statsData.inactiveAdmins?.change || 0),
        direction: (statsData.inactiveAdmins?.change || 0) >= 0 ? "decline" : "progress",
        icon: EmptyIcon,
        showIcon: false,
        suffix: ""
      },
      {
        title: "Pending Invites",
        emptyBalance: "0",
        nonEmptyBalance: statsData.pendingInvites?.count?.toString() || "0",
        emptyPercentage: "0%",
        nonEmptyPercentage: formatChange(statsData.pendingInvites?.change || 0),
        direction: (statsData.pendingInvites?.change || 0) >= 0 ? "progress" : "decline",
        icon: EmptyIcon,
        showIcon: false,
        suffix: ""
      }
    ];
  }, [adminStatsResponse]);

  // Map status filter to API format
  const getStatusFilter = (status: string): 'active' | 'inactive' | 'pending_invite' | undefined => {
    if (status === "All Status") return undefined;
    if (status === "Active") return 'active';
    if (status === "Inactive") return 'inactive';
    if (status === "Pending Invite") return 'pending_invite';
    return undefined;
  }

  // Fetch admin users from API
  const { data: adminUsersResponse, isLoading: isLoadingAdminUsers } = useAdminUsers({
    page: activeTab === "admin-users" ? currentPage : 1,
    limit: activeTab === "admin-users" ? itemsPerPage : 1,
    search: activeTab === "admin-users" && searchQuery ? searchQuery : undefined,
    status: activeTab === "admin-users" ? getStatusFilter(selectedStatus) : undefined,
  });

  // Transform API data to match table structure
  const adminUsers = useMemo(() => {
    if (!adminUsersResponse?.users) return [];
    return adminUsersResponse.users.map(user => ({
      id: user.id,
      name: user.name || user.email.split('@')[0] || 'N/A',
      email: user.email,
      role: user.role || 'N/A',
      status: user.status === 'pending_invite' ? 'Pending Invite' : 
              user.status === 'active' ? 'Active' : 
              user.status === 'inactive' ? 'Inactive' : user.status,
    }));
  }, [adminUsersResponse]);

  const totalPages = adminUsersResponse?.pagination?.totalPages || 1;
  const paginatedData = adminUsers;

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(permissionsSearchQuery.toLowerCase())
    return matchesSearch
  })

  const permissionsTotalPages = Math.ceil(filteredPermissions.length / permissionsItemsPerPage)
  const permissionsStartIndex = (permissionsCurrentPage - 1) * permissionsItemsPerPage
  const permissionsEndIndex = permissionsStartIndex + permissionsItemsPerPage
  const paginatedPermissions = filteredPermissions.slice(permissionsStartIndex, permissionsEndIndex)

  // Filter and paginate roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(rolesSearchQuery.toLowerCase())
    return matchesSearch
  })
  }, [roles, rolesSearchQuery])

  const rolesTotalPages = Math.ceil(filteredRoles.length / rolesItemsPerPage)
  const rolesStartIndex = (rolesCurrentPage - 1) * rolesItemsPerPage
  const rolesEndIndex = rolesStartIndex + rolesItemsPerPage
  const paginatedRoles = filteredRoles.slice(rolesStartIndex, rolesEndIndex)

  const handlers = {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value))
      setCurrentPage(1)
    },
    onPermissionsChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPermissionsItemsPerPage(Number(e.target.value))
      setPermissionsCurrentPage(1)
    },
    onEditPermission: (permission: any) => {
      setSelectedPermission(permission)
      setShowEditPermissionModal(true)
    },
    onDisablePermission: (permission: any) => {
      setSelectedPermission(permission)
      setShowDisablePermissionModal(true)
    },
    onActivatePermission: (permission: any) => {
      setSelectedPermission(permission)
      setShowActivatePermissionModal(true)
    },
    onDeletePermission: (permission: any) => {
      setPermissions(prev => prev.filter(p => p.id !== permission.id))
    },
    onDeletePermissionClick: (permission: any) => {
      setSelectedPermission(permission)
      setShowDeletePermissionModal(true)
    },
    onConfirmActivate: () => {
      if (selectedPermission) {
        setPermissions(prev => prev.map(p => 
          p.id === selectedPermission.id ? { ...p, status: "Active" } : p
        ))
      }
    },
    onConfirmDelete: () => {
      if (selectedPermission) {
        setPermissions(prev => prev.filter(p => p.id !== selectedPermission.id))
      }
    },
    onRolesChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRolesItemsPerPage(Number(e.target.value))
      setRolesCurrentPage(1)
    },
    onViewRoleDetails: (role: any) => {
      setSelectedRole({
        ...role,
        usersAssigned: role.users,
        permissionsIncluded: typeof role.permissions === 'number' ? role.permissions : role.permissions,
        createdBy: "Super Admin",
        dateCreated: "12th Nov. 2025",
        permissions: Array.from({ length: 8 }, (_, i) => ({
          name: "View dashboard",
          status: i % 2 === 0 ? 'Active' : 'Inactive' as 'Active' | 'Inactive'
        }))
      })
      setShowRoleDetailsModal(true)
    },
    onEditRoleClick: () => {
      setShowRoleDetailsModal(false)
      setShowEditRoleModal(true)
    },
    onEditRole: (role: any) => {
      setSelectedRole(role)
      setShowEditRoleModal(true)
    },
    onDeactivateRole: (role: any) => {
      setSelectedRole(role)
      setShowDeactivateRoleModal(true)
    },
    onConfirmDeactivateRole: () => {
      // Role status will be updated via API and refetched
      // Local state update removed - data comes from API
    },
    onActivateRole: (role: any) => {
      setSelectedRole(role)
      setShowActivateRoleModal(true)
    },
    onConfirmActivateRole: () => {
      // Role status will be updated via API and refetched
      // Local state update removed - data comes from API
    },
    onSaveRole: (updatedRole: { id: string, name: string, permissions: string[] }) => {
      // Role will be updated via API and refetched
      // Local state update removed - data comes from API
    },
    onSavePermission: (updatedPermission: { id: string, name: string }) => {
      setPermissions(prev => prev.map(p => 
        p.id === updatedPermission.id ? { ...p, name: updatedPermission.name } : p
      ))
    },
    onConfirmDisable: () => {
      if (selectedPermission) {
        setPermissions(prev => prev.map(p => 
          p.id === selectedPermission.id ? { ...p, status: "Inactive" } : p
        ))
      }
    }
  }

  return (
    <MainLayout>
      <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
        <Container>
          <div className='w-full flex justify-between items-center'>
            <h1 className='text-[18px] md:text-[28px] font-semibold'>Roles & Permissions</h1>
          </div>

          {/* Stats Cards */}
          <div className='w-full flex flex-col md:flex-row gap-4 mt-6 overflow-hidden'>
            {isLoadingStats ? (
              <div className='w-full flex justify-center items-center min-h-[120px]'>
                <LoadingSpinner />
              </div>
            ) : (
              stats.map(item => {
                return (
                  <Fragment key={item.title}>
                    <StatCard item={item} isEmpty={isEmpty} Icon={item.icon} />
                  </Fragment>
                )
              })
            )}
          </div>

          {/* Tabs */}
          <div className='w-full mt-6 flex gap-0 relative'>
            {
              tabs.map((tab, index) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-6 py-3 text-sm font-medium transition-all relative',
                    activeTab === tab.key 
                      ? 'text-[#212121] bg-white rounded-lg shadow-sm z-10 font-semibold' 
                      : 'text-[#5E6775] bg-[#F7F7F7]'
                  )}
                >
                  {tab.name}
                </button>
              ))
            }
          </div>

          {/* Content Area */}
          <div className='w-full mt-6 flex flex-col lg:flex-row gap-6'>
            {/* Main Content */}
            <div className='w-full lg:w-[calc(100%-304px)]'>
              {activeTab === "admin-users" && (
                <>
              {/* Search and Filter */}
              <div className='flex flex-col md:flex-row gap-4 mb-6'>
                <div className='flex-1 relative'>
                  <input
                    type="text"
                    placeholder="Search by admin names, roles"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className='w-full px-4 py-2 pl-10 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent'
                  />
                  <SearchIcon
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5E6775]'
                  />
                </div>
                <div className='w-full md:w-[150px]'>
                  <SelectAltInput 
                    options={['All Status', 'Active', 'Inactive', 'Pending Invite']} 
                    isEmpty={isEmpty} 
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Desktop Table */}
              {isLoadingAdminUsers ? (
                <div className='w-full flex justify-center items-center min-h-[400px]'>
                  <LoadingSpinner />
                </div>
              ) : (
              <div className='hidden md:block w-full overflow-x-auto max-w-full'>
                <AdminsTable tableData={paginatedData} tableHeaders={tableHeaders} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onChange={handlers.onChange}
                    totalData={adminUsersResponse?.pagination?.totalItems || 0}
                />
              </div>
              )}
                </>
              )}

              {activeTab === "roles" && (
                <>
                  {/* Search */}
                  <div className='flex flex-col md:flex-row gap-4 mb-6'>
                    <div className='flex-1 relative'>
                      <input
                        type="text"
                        placeholder="Search by role name"
                        value={rolesSearchQuery}
                        onChange={(e) => setRolesSearchQuery(e.target.value)}
                        className='w-full px-4 py-2 pl-10 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent'
                      />
                      <SearchIcon
                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5E6775]'
                      />
                    </div>
                  </div>

                  {/* Roles Table */}
                  {isLoadingRoles ? (
                    <div className='w-full bg-white p-6 flex justify-center items-center min-h-[400px]'>
                      <LoadingSpinner />
                    </div>
                  ) : (
                  <div className='w-full bg-white rounded-[8px] overflow-hidden'>
                    <RolesTable 
                      tableData={paginatedRoles} 
                      tableHeaders={rolesTableHeaders}
                      onViewDetails={handlers.onViewRoleDetails}
                      onEditRole={handlers.onEditRole}
                      onDeactivateRole={handlers.onDeactivateRole}
                      onActivateRole={handlers.onActivateRole}
                    />
                  </div>
                  )}
                  
                  <Pagination
                    currentPage={rolesCurrentPage}
                    totalPages={rolesTotalPages}
                    setCurrentPage={setRolesCurrentPage}
                    itemsPerPage={rolesItemsPerPage}
                    onChange={handlers.onRolesChange}
                    totalData={filteredRoles.length}
                  />
                </>
              )}

              {/* {activeTab === "permissions" && (
                <>
                  <div className='flex flex-col md:flex-row gap-4 mb-6'>
                    <div className='flex-1 relative'>
                      <input
                        type="text"
                        placeholder="Search by permission name"
                        value={permissionsSearchQuery}
                        onChange={(e) => setPermissionsSearchQuery(e.target.value)}
                        className='w-full px-4 py-2 pl-10 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent'
                      />
                      <SearchIcon
                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5E6775]'
                      />
                    </div>
                  </div>

                  <div className='w-full bg-white rounded-[8px] overflow-hidden'>
                    <PermissionsTable 
                      tableData={paginatedPermissions} 
                      tableHeaders={permissionsTableHeaders}
                      onEdit={handlers.onEditPermission}
                      onDisable={handlers.onDisablePermission}
                      onActivate={handlers.onActivatePermission}
                      onDelete={handlers.onDeletePermission}
                      onDeleteClick={handlers.onDeletePermissionClick}
                    />
                  </div>
                  
                  <Pagination
                    currentPage={permissionsCurrentPage}
                    totalPages={permissionsTotalPages}
                    setCurrentPage={setPermissionsCurrentPage}
                    itemsPerPage={permissionsItemsPerPage}
                    onChange={handlers.onPermissionsChange}
                    totalData={filteredPermissions.length}
                  />
                </>
              )} */}

              {/* Mobile Card View - Admin Users */}
              {activeTab === "admin-users" && (
              <div className='flex flex-col gap-4 md:hidden'>
                {isLoadingAdminUsers ? (
                  <div className='w-full flex justify-center items-center min-h-[400px]'>
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                {
                  paginatedData.map((data, i) => {
                    const getStatusBadgeClass = (status: string) => {
                      if (status === "Active") {
                        return "bg-[#F0FDF4] text-[#0E5831]";
                      } else if (status === "Pending Invite") {
                        return "bg-[#FBF3E9] text-[#C17B1F]";
                      } else if (status === "Inactive") {
                        return "bg-[#F7F7F7] text-[#5E6775]";
                      }
                      return "bg-[#F7F7F7] text-[#5E6775]";
                    }

                    return (
                      <div 
                        key={i} 
                        className='w-full bg-white rounded-[12px] p-6 shadow-[0_4px_12px_0_#21212112] flex flex-col gap-4'
                      >
                        {/* Admin Name */}
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-[#5E6775]'>Admin Name</span>
                          <span className='text-sm text-[#212121] font-medium'>{data.name}</span>
                        </div>
                        
                        {/* Email Address */}
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-[#5E6775]'>Email Address</span>
                          <span className='text-sm text-[#212121] font-medium'>{data.email}</span>
                        </div>
                        
                        {/* Role */}
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-[#5E6775]'>Role</span>
                          <span className='text-sm text-[#212121] font-medium'>{data.role}</span>
                        </div>
                        
                        {/* Status */}
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-[#5E6775]'>Status</span>
                          <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', getStatusBadgeClass(data.status))}>
                            {data.status}
                          </span>
                        </div>
                        
                        {/* Action Button */}
                        <button className='w-full mt-2 px-4 py-3 border border-[#5F3DF4] text-[#5F3DF4] text-sm font-medium rounded-[8px] text-center hover:bg-[#F7F7F7] transition-colors'>
                          Action
                        </button>
                      </div>
                    )
                  })
                }
                
                {/* Mobile Pagination */}
                <div className='w-full mt-4'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onChange={handlers.onChange}
                    totalData={adminUsersResponse?.pagination?.totalItems || 0}
                  />
                </div>
                  </>
                )}
              </div>
              )}
            </div>

            {/* Quick Action Sidebar */}
            <div className='w-full lg:w-[280px] flex flex-col gap-4'>
              <div className='p-6 border border-[#D5D9DE] rounded-2xl'>
                <h2 className='text-base font-semibold text-[#212121] mb-4'>Quick Action</h2>
                <div className='flex flex-col gap-3'>
                  <button 
                    onClick={() => setShowAddAdminModal(true)}
                    className='w-full px-4 py-3 bg-[#5F3DF4] text-white text-sm font-medium rounded-lg hover:bg-[#4d2fd4] transition-colors'
                  >
                    Add an Admin
                  </button>
                  {/* <button 
                    onClick={() => setShowCreatePermissionModal(true)}
                    className='w-full px-4 py-3 bg-transparent border border-[#5F3DF4] text-[#5F3DF4] text-sm font-medium rounded-lg hover:bg-[#F7F7F7] transition-colors'
                  >
                    Create a Permission
                  </button> */}
                  {/* <button 
                    onClick={() => setShowCreateRoleModal(true)}
                    className='w-full px-4 py-3 bg-transparent text-[#5F3DF4] text-sm font-medium rounded-lg hover:bg-[#F7F7F7] transition-colors text-left'
                  >
                    Create a Role
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Add Admin Modal */}
      <Modals.AddAdmin 
        open={showAddAdminModal} 
        setTrigger={setShowAddAdminModal} 
      />
      
      {/* Create Permission Modal */}
      {/* <Modals.CreatePermission 
        open={showCreatePermissionModal} 
        setTrigger={setShowCreatePermissionModal} 
      /> */}
      
      {/* Create Role Modal */}
      <Modals.CreateRole 
        open={showCreateRoleModal} 
        setTrigger={setShowCreateRoleModal} 
      />
      
      {/* Edit Permission Modal */}
      {/* <Modals.EditPermission
        open={showEditPermissionModal}
        setTrigger={setShowEditPermissionModal}
        permission={selectedPermission}
        onSave={handlers.onSavePermission}
      /> */}
      
      {/* Disable Permission Modal */}
      {/* <Modals.DisablePermission
        open={showDisablePermissionModal}
        setTrigger={setShowDisablePermissionModal}
        permission={selectedPermission}
        onConfirm={handlers.onConfirmDisable}
      /> */}
      
      {/* Activate Permission Modal */}
      {/* <Modals.ActivatePermission
        open={showActivatePermissionModal}
        setTrigger={setShowActivatePermissionModal}
        permission={selectedPermission}
        onConfirm={handlers.onConfirmActivate}
      /> */}
      
      {/* Delete Permission Modal */}
      {/* <Modals.DeletePermission
        open={showDeletePermissionModal}
        setTrigger={setShowDeletePermissionModal}
        permission={selectedPermission}
        onConfirm={handlers.onConfirmDelete}
      /> */}
      
      {/* Role Details Modal */}
      <Modals.RoleDetails
        open={showRoleDetailsModal}
        setTrigger={setShowRoleDetailsModal}
        role={selectedRole}
        onEditRole={handlers.onEditRoleClick}
      />
      
      {/* Edit Role Modal */}
      <Modals.EditRole
        open={showEditRoleModal}
        setTrigger={setShowEditRoleModal}
        role={selectedRole}
        onSave={handlers.onSaveRole}
      />
      
      {/* Deactivate Role Modal */}
      <Modals.DeactivateRole
        open={showDeactivateRoleModal}
        setTrigger={setShowDeactivateRoleModal}
        role={selectedRole}
        onConfirm={handlers.onConfirmDeactivateRole}
      />
      
      {/* Activate Role Modal */}
      <Modals.ActivateRole
        open={showActivateRoleModal}
        setTrigger={setShowActivateRoleModal}
        role={selectedRole}
        onConfirm={handlers.onConfirmActivateRole}
      />
    </MainLayout>
  )
}

export default page
