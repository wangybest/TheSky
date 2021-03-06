export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
/*      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './User/login',
          },
        ],
      },*/
      {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/',
            component: '../layouts/BasicLayout',
            // authority: ['admin', 'user'],
            routes: [
                          {
                            path: '/',
                            redirect: '/excel',
                          },
/*                          {
                            path: '/welcome',
                            name: 'welcome',
                            icon: 'smile',
                            component: './excel/ExcelHandler',
                          },*/
/*              {
                path: '/admin',
                name: 'admin',
                icon: 'crown',
                component: './Admin',
                authority: ['admin'],
                routes: [
                  {
                    path: '/admin/sub-page',
                    name: 'sub-page',
                    icon: 'smile',
                    component: './Welcome',
                    authority: ['admin'],
                  },
                ],
              },*/
/*              {
                name: 'list.table-list',
                icon: 'table',
                path: '/list',
                hideInMenu: true,
                component: './TableList',
              },*/
              {
                name: 'excel',
                icon: 'table',
                path: '/excel',
                component: './excel/ExcelHandler',
              },
              {
                component: './404',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
  {
    component: './404',
  },
];
