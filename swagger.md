# 江心上客栈 API 接口文档

## 商品相关接口

### 1. 获取商品列表
```typescript:components/product-grid.tsx
startLine: 23
endLine: 33
```

- **URL**  
  `GET /api/products`

- **请求参数**  
  ```json
  {
    "sort": "newest | best-selling | price-high | price-low",
    "search": "string"
  }
  ```

- **响应示例**  
  ```json
  [
    {
      "id": "1",
      "title": "地铁.mp3",
      "description": "作为小O的你，在地铁上被陌生女A欺负了？！",
      "price": 29.9,
      "image": "https://ucarecdn.com/f58a1bee...",
      "sales": 520
    }
  ]
  ```

---

## 购物车接口

### 1. 获取购物车内容

```typescript:app/cart/page.tsx
startLine: 20
endLine: 30
```

- **URL**  
  `GET /api/cart`

- **响应示例**  
  ```json
  {
    "items": [
      {
        "id": "1",
        "title": "地铁.mp3",
        "price": 29.9,
        "quantity": 1,
        "image": "https://ucarecdn.com/f58a1bee..."
      }
    ],
    "subtotal": 29.9,
    "shipping": 0,
    "total": 29.9
  }
  ```

### 2. 更新商品数量
```typescript:app/cart/page.tsx
startLine: 36
endLine: 43
```

- **URL**  
  `PUT /api/cart/{itemId}`

- **请求参数**  
  ```json
  {
    "quantity": 2
  }
  ```

### 3. 删除购物车商品
```typescript:app/cart/page.tsx
startLine: 45
endLine: 47
```

- **URL**  
  `DELETE /api/cart/{itemId}`

### 4. 结算购物车
```typescript:app/cart/page.tsx
startLine: 124
endLine: 124
```

- **URL**  
  `POST /api/orders`

- **请求参数**  
  ```json
  {
    "items": [
      {
        "id": "1",
        "quantity": 1
      }
    ],
    "total": 29.9
  }
  ```

---

## 用户接口

### 1. 用户登录
```typescript:app/auth/login/page.tsx
startLine: 20
endLine: 33
```

- **URL**  
  `POST /api/auth/login`

- **请求参数**  
  ```json
  {
    "email": "jmy@163.com",
    "password": "123456"
  }
  ```

- **响应示例**  
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "1",
      "name": "江夫人",
      "email": "jmy@163.com",
      "avatar": "https://ucarecdn.com/34e271b8..."
    }
  }
  ```

### 2. 用户注册
```typescript:app/auth/register/page.tsx
startLine: 16
endLine: 29
```

- **URL**  
  `POST /api/auth/register`

- **请求参数**  
  ```json
  {
    "email": "new_user@example.com",
    "password": "new_password",
    "confirmPassword": "new_password"
  }
  ```

### 3. 获取用户信息
```typescript:app/profile/page.tsx
startLine: 12
endLine: 21
```

- **URL**  
  `GET /api/users/{userId}`

- **响应示例**  
  ```json
  {
    "id": "1",
    "name": "江夫人",
    "email": "jmy@163.com",
    "avatar": "https://ucarecdn.com/34e271b8...",
    "purchaseHistory": [
      {
        "id": "1",
        "productName": "地铁.mp3",
        "price": 29.9,
        "purchaseDate": "2024-03-15"
      }
    ]
  }
  ```

### 4. 更新用户信息
```typescript:app/profile/page.tsx
startLine: 16
endLine: 21
```

- **URL**  
  `PUT /api/users/{userId}`

- **请求参数**  
  ```json
  {
    "name": "新名字",
    "avatar": "新头像URL"
  }
  ```

### 5. 修改密码
```typescript:app/profile/reset-password/page.tsx
startLine: 10
endLine: 81
```

- **URL**  
  `PUT /api/users/{userId}/password`

- **请求参数**  
  ```json
  {
    "currentPassword": "旧密码",
    "newPassword": "新密码",
    "confirmPassword": "确认密码"
  }
  ```

---

## 订单接口

### 1. 获取订单历史
```typescript:app/profile/purchase-history/page.tsx
startLine: 14
endLine: 43
```

- **URL**  
  `GET /api/orders`

- **响应示例**  
  ```json
  [
    {
      "id": "1",
      "productName": "地铁.mp3",
      "price": 29.9,
      "purchaseDate": "2024-03-15"
    }
  ]
  ```

---

## 库存接口

### 1. 获取用户库存
```typescript:app/inventory/page.tsx
startLine: 24
endLine: 32
```

- **URL**  
  `GET /api/inventory`

- **响应示例**  
  ```json
  [
    {
      "id": "1",
      "title": "地铁.mp3",
      "description": "作为小O的你，在地铁上被陌生女A欺负了？！",
      "image": "https://ucarecdn.com/f58a1bee...",
      "purchaseDate": "2024-03-15"
    }
  ]
  ```

### 2. 下载商品
```typescript:app/inventory/page.tsx
startLine: 84
endLine: 84
```

- **URL**  
  `GET /api/products/{id}/download`

---

## 通用响应格式
```typescript:lib/auth.ts
startLine: 4
endLine: 15
```

**成功响应**  
```json
{
  "code": 200,
  "data": {},
  "message": "操作成功"
}
```

**错误响应**  
```json
{
  "code": 400,
  "error": "错误信息",
  "message": "错误描述"
}
```
