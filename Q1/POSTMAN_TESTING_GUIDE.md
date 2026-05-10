# Student Management API - Postman Testing Guide

## Base URL
```
http://localhost:3000
```

## API Endpoints Overview

### 1. **CREATE STUDENT** - POST /api/students
- **URL**: `http://localhost:3000/api/students`
- **Method**: POST
- **Content-Type**: application/json
- **Request Body**:
```json
{
  "rollNumber": "21-CS-105",
  "name": "Ali Hassan",
  "email": "ali.hassan@university.edu",
  "department": "Computer Science",
  "cgpa": 3.78,
  "enrollmentYear": 2021
}
```
- **Expected Response (201)**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "rollNumber": "21-CS-105",
    "name": "Ali Hassan",
    "email": "ali.hassan@university.edu",
    "department": "Computer Science",
    "cgpa": 3.78,
    "enrollmentYear": 2021,
    "isActive": true,
    "__v": 0
  }
}
```

---

### 2. **GET ALL STUDENTS** - GET /api/students
- **URL**: `http://localhost:3000/api/students`
- **Method**: GET
- **Expected Response (200)**: Array of all students

---

### 3. **GET STUDENTS WITH PAGINATION** - GET /api/students?page=1&limit=10
- **URL**: `http://localhost:3000/api/students?page=1&limit=10`
- **Method**: GET
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Records per page (default: 10)
- **Example**: 
  - `http://localhost:3000/api/students?page=1&limit=2`
  - `http://localhost:3000/api/students?page=2&limit=5`

---

### 4. **FILTER BY DEPARTMENT** - GET /api/students?department=...
- **URL**: `http://localhost:3000/api/students?department=Computer Science`
- **Method**: GET
- **Query Parameters**:
  - `department` (optional): Filter by department name
  - `page` (optional): Page number
  - `limit` (optional): Records per page
- **Examples**:
  - `http://localhost:3000/api/students?department=Computer Science`
  - `http://localhost:3000/api/students?department=Electrical`
  - `http://localhost:3000/api/students?department=Computer Science&page=1&limit=10`

---

### 5. **SEARCH BY NAME** - GET /api/students/search?name=...
- **URL**: `http://localhost:3000/api/students/search?name=Ali`
- **Method**: GET
- **Query Parameters**:
  - `name` (required): Search term (case-insensitive, partial match with regex)
- **Examples**:
  - `http://localhost:3000/api/students/search?name=Ali`
  - `http://localhost:3000/api/students/search?name=Sarah`
  - `http://localhost:3000/api/students/search?name=h` (matches "Hassan", "Ahmed", etc.)

---

### 6. **GET STUDENT BY ID** - GET /api/students/:id
- **URL**: `http://localhost:3000/api/students/507f1f77bcf86cd799439011`
- **Method**: GET
- **Path Parameter**: `:id` - MongoDB ObjectId
- **Note**: Replace ID with actual student MongoDB _id from previous responses
- **Expected Response (200)**: Single student object
- **Expected Response (404)**: `{ "success": false, "message": "Student not found" }`

---

### 7. **UPDATE STUDENT (FULL)** - PUT /api/students/:id
- **URL**: `http://localhost:3000/api/students/507f1f77bcf86cd799439011`
- **Method**: PUT
- **Content-Type**: application/json
- **Request Body** (all fields required):
```json
{
  "rollNumber": "21-CS-105",
  "name": "Ali Hassan Updated",
  "email": "ali.updated@university.edu",
  "department": "Computer Science",
  "cgpa": 3.85,
  "enrollmentYear": 2021
}
```
- **Note**: Replace ID with actual student MongoDB _id
- **Expected Response (200)**: Updated student object

---

### 8. **UPDATE STUDENT (PARTIAL)** - PATCH /api/students/:id
- **URL**: `http://localhost:3000/api/students/507f1f77bcf86cd799439011`
- **Method**: PATCH
- **Content-Type**: application/json
- **Request Body** (one or more fields):
```json
{
  "cgpa": 3.90,
  "name": "Updated Name"
}
```
- **Examples**:
  - Single field: `{ "cgpa": 3.95 }`
  - Multiple fields: `{ "name": "New Name", "email": "new@university.edu", "cgpa": 3.80 }`
- **Note**: Replace ID with actual student MongoDB _id
- **Expected Response (200)**: Updated student object

---

### 9. **SOFT DELETE (DEACTIVATE)** - PATCH /api/students/:id/deactivate
- **URL**: `http://localhost:3000/api/students/507f1f77bcf86cd799439011/deactivate`
- **Method**: PATCH
- **Content-Type**: application/json
- **Request Body**: `{}` (empty object)
- **Note**: Sets `isActive` to `false` instead of deleting
- **Expected Response (200)**:
```json
{
  "success": true,
  "message": "Student deactivated successfully",
  "data": { /* student object with isActive: false */ }
}
```

---

### 10. **HARD DELETE** - DELETE /api/students/:id
- **URL**: `http://localhost:3000/api/students/507f1f77bcf86cd799439011`
- **Method**: DELETE
- **Note**: Permanently removes student from database. Replace ID with actual student MongoDB _id
- **Expected Response (200)**:
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```
- **Expected Response (404)**: `{ "success": false, "message": "Student not found" }`

---

## Error Handling Tests

### Test 1: Invalid Email Format
```json
POST http://localhost:3000/api/students
{
  "rollNumber": "21-CS-999",
  "name": "Invalid Email",
  "email": "not-a-valid-email",
  "department": "Computer Science",
  "cgpa": 3.5,
  "enrollmentYear": 2021
}
```
**Expected**: 400 Bad Request with validation error

### Test 2: Missing Required Field
```json
POST http://localhost:3000/api/students
{
  "rollNumber": "21-CS-999",
  "name": "Test Student"
}
```
**Expected**: 400 Bad Request - missing required fields

### Test 3: Invalid CGPA (Out of Range)
```json
POST http://localhost:3000/api/students
{
  "rollNumber": "21-CS-999",
  "name": "Invalid CGPA",
  "email": "test@university.edu",
  "department": "Computer Science",
  "cgpa": 5.5,
  "enrollmentYear": 2021
}
```
**Expected**: 400 Bad Request - CGPA must be between 0.0 and 4.0

### Test 4: Duplicate Roll Number
```json
POST http://localhost:3000/api/students
{
  "rollNumber": "21-CS-105",  // Already exists
  "name": "Another Student",
  "email": "another@university.edu",
  "department": "Computer Science",
  "cgpa": 3.5,
  "enrollmentYear": 2021
}
```
**Expected**: 400 Bad Request - rollNumber already exists

### Test 5: Non-Existent Student ID
```
GET http://localhost:3000/api/students/507f1f77bcf86cd799439011
```
**Expected**: 404 Not Found

---

## Sample Test Flow

1. **Create 3 students** (use requests 1, 2, 3)
   - Ali Hassan (Computer Science)
   - Sarah Ahmed (Computer Science)
   - Muhammad Karim (Electrical)

2. **Retrieve All Students** (use request 4)
   - Verify all 3 students appear

3. **Filter by Department** (use request 7)
   - Filter by "Computer Science" - should show 2 students

4. **Search by Name** (use request 9)
   - Search "Ali" - should find Ali Hassan

5. **Update Student** (use request 12 or 13)
   - Use student ID from step 1 to update Ali Hassan's CGPA

6. **Soft Delete** (use request 15)
   - Deactivate one student

7. **Hard Delete** (use request 16)
   - Delete another student

8. **Error Handling** (use requests 17-19)
   - Test validation errors

---

## How to Import Collection into Postman

1. Open Postman
2. Click **Import** button (top left)
3. Select **Upload Files** tab
4. Choose the file: `Student_Management_API_Collection.postman_collection.json`
5. Click **Import**
6. All 20 requests will be imported

---

## Variables to Replace

When using requests with IDs, replace these variables:
- `{{studentId}}` - Replace with actual MongoDB ObjectId from API responses (copy from `_id` field)

---

## Expected Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, PATCH, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Server Error |

---

## Notes

- All timestamps are in ISO 8601 format
- `isActive` defaults to `true` for new students
- Search is case-insensitive
- Pagination: If no page/limit provided, returns all records
- CGPA must be between 0.0 and 4.0
- Email must be valid and unique
- Roll Number must be unique
