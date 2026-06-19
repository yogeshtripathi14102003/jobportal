import * as EmployeeService from "../../hrms/services/employee.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import { sendSuccess } from "../../../utils/ApiResponse.js";

export const addEmployee = asyncHandler(async (req, res) => {
  const { user, employee } = await EmployeeService.addEmployee(
    req.body, req.files, req.user._id
  );
  sendSuccess(res, 201, "Employee added successfully.", { user, employee });
});

export const getAllEmployees = asyncHandler(async (req, res) => {
  const data = await EmployeeService.getAllEmployees(req.query);
  sendSuccess(res, 200, "Employees fetched.", data);
});

export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.getEmployeeById(req.params.id);
  sendSuccess(res, 200, "Employee fetched.", { employee });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.getMyProfile(req.user._id);
  sendSuccess(res, 200, "Profile fetched.", { employee });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.updateEmployee(
    req.params.id, req.body, req.files
  );
  sendSuccess(res, 200, "Employee updated.", { employee });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  await EmployeeService.deleteEmployee(req.params.id);
  sendSuccess(res, 200, "Employee terminated.");
});