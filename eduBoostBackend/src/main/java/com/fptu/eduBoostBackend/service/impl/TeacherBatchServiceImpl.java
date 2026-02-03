package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.BatchImportStudentRequest;
import com.fptu.eduBoostBackend.dto.request.CreateStudentRequest;
import com.fptu.eduBoostBackend.dto.response.BatchImportStudentResponse;
import com.fptu.eduBoostBackend.dto.response.TemplateDownloadResponse;
import com.fptu.eduBoostBackend.entities.Class;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.Gender;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.TeacherBatchService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherBatchServiceImpl implements TeacherBatchService {

    private final TeacherRepository teacherRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final com.fptu.eduBoostBackend.service.TeacherService teacherService;

    // Excel column indices
    private static final int COL_EMAIL = 0;
    private static final int COL_FULL_NAME = 1;
    private static final int COL_PHONE = 2;
    private static final int COL_DATE_OF_BIRTH = 3;
    private static final int COL_GENDER = 4;
    private static final int COL_ADDRESS = 5;
    private static final int COL_ENROLLMENT_DATE = 6;
    private static final int COL_PARENT_EMAIL = 7;

    // Headers for the template
    private static final String[] HEADERS = {
            "Email*",
            "Full Name*",
            "Phone",
            "Date of Birth (MM/DD/YYYY)",
            "Gender*",
            "Address",
            "Enrollment Date (MM/DD/YYYY)",
            "Parent Email (Contact)"
    };

    private Teacher getCurrentTeacher() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return teacherRepository.findByUser(currentUser)
                .orElseThrow(() -> new ForbiddenException("User is not a teacher"));
    }

    @Override
    public TemplateDownloadResponse downloadTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Student Import Template");

            // Create styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // TEXT format for phone numbers
            CellStyle textStyle = workbook.createCellStyle();
            DataFormat textFormat = workbook.createDataFormat();
            textStyle.setDataFormat(textFormat.getFormat("@"));

            // DATE format for date columns (MM/dd/yyyy)
            CellStyle dateStyle = workbook.createCellStyle();
            DataFormat dateFormat = workbook.createDataFormat();
            dateStyle.setDataFormat(dateFormat.getFormat("MM/dd/yyyy"));

            // Create header row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);

                if (i == COL_PHONE) {
                    cell.setCellStyle(textStyle);
                } else if (i == COL_DATE_OF_BIRTH || i == COL_ENROLLMENT_DATE) {
                    cell.setCellStyle(dateStyle);
                }
            }

            // Data validation for Gender
            DataValidationHelper dvHelper = sheet.getDataValidationHelper();
            DataValidationConstraint dvConstraint = dvHelper.createExplicitListConstraint(
                    new String[]{"MALE", "FEMALE", "OTHER"}
            );
            CellRangeAddressList genderRange = new CellRangeAddressList(1, 1000, COL_GENDER, COL_GENDER);
            DataValidation genderValidation = dvHelper.createValidation(dvConstraint, genderRange);
            genderValidation.setShowErrorBox(true);
            sheet.addValidationData(genderValidation);

            // Set column widths
            sheet.setColumnWidth(COL_EMAIL, 32 * 256);
            sheet.setColumnWidth(COL_FULL_NAME, 40 * 256);
            sheet.setColumnWidth(COL_PHONE, 18 * 256);
            sheet.setColumnWidth(COL_DATE_OF_BIRTH, 20 * 256);
            sheet.setColumnWidth(COL_GENDER, 15 * 256);
            sheet.setColumnWidth(COL_ADDRESS, 50 * 256);
            sheet.setColumnWidth(COL_ENROLLMENT_DATE, 24 * 256);
            sheet.setColumnWidth(COL_PARENT_EMAIL, 32 * 256);

            // Add example row
            Row exampleRow = sheet.createRow(1);

            exampleRow.createCell(COL_EMAIL).setCellValue("student1@example.com");
            exampleRow.createCell(COL_FULL_NAME).setCellValue("Nguyễn Văn A");

            // Phone - as text
            Cell phoneCell = exampleRow.createCell(COL_PHONE);
            phoneCell.setCellValue("0987654321");
            phoneCell.setCellStyle(textStyle);

            // Date of Birth - as date with example
            Cell dobCell = exampleRow.createCell(COL_DATE_OF_BIRTH);
            dobCell.setCellValue("01/15/2010"); // String example
            dobCell.setCellStyle(dateStyle);

            exampleRow.createCell(COL_GENDER).setCellValue("MALE");
            exampleRow.createCell(COL_ADDRESS).setCellValue("123 Đường ABC, Quận 1");

            // Enrollment Date - as date with example
            Cell enrollmentCell = exampleRow.createCell(COL_ENROLLMENT_DATE);
            enrollmentCell.setCellValue("09/01/2024"); // String example
            enrollmentCell.setCellStyle(dateStyle);

            exampleRow.createCell(COL_PARENT_EMAIL).setCellValue("parent1@example.com");

            // Apply styles to entire columns
            for (int rowNum = 1; rowNum <= 1000; rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null) {
                    row = sheet.createRow(rowNum);
                }

                // Phone column
                Cell phoneColCell = row.createCell(COL_PHONE);
                phoneColCell.setCellStyle(textStyle);

                // Date columns
                row.createCell(COL_DATE_OF_BIRTH).setCellStyle(dateStyle);
                row.createCell(COL_ENROLLMENT_DATE).setCellStyle(dateStyle);
            }

            // Freeze header
            sheet.createFreezePane(0, 1);

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return TemplateDownloadResponse.builder()
                    .fileName("student_import_template.xlsx")
                    .contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .content(outputStream.toByteArray())
                    .size(outputStream.size())
                    .build();
        }
    }
    @Override
    public BatchImportStudentResponse importStudents(MultipartFile file, BatchImportStudentRequest request) throws IOException {
        Teacher teacher = getCurrentTeacher();

        // Validate class access
        Class classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "classId", request.getClassId()));
        validateTeacherHasClassAccess(classEntity, teacher);


        List<BatchImportStudentResponse.ImportError> errors = new ArrayList<>();
        int successfulImports = 0;
        int totalRows = 0;

        List<CreateStudentRequest> studentRequests = new ArrayList<>();
        Map<CreateStudentRequest, Integer> requestRowMap = new HashMap<>();


        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip header row
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            // First pass: Parse all rows and collect validation errors
            int rowNum = 1;
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNum++;


                try {
                    // Skip empty rows
                    if (isRowEmpty(row)) {
                        continue;
                    }
                    totalRows++;
                    // Parse row data
                    StudentRowData rowData = parseStudentRow(row, rowNum);

                    // Validate row data
                    validateStudentRow(rowData, rowNum);

                    // Create student request
                    CreateStudentRequest createRequest = CreateStudentRequest.builder()
                            .email(rowData.getEmail())
                            .fullName(rowData.getFullName())
                            .phone(rowData.getPhone())
                            .classId(request.getClassId())
                            .dateOfBirth(rowData.getDateOfBirth())
                            .gender(rowData.getGender())
                            .address(rowData.getAddress())
                            .enrollmentDate(rowData.getEnrollmentDate())
                            .contact(rowData.getParentEmail())
                            .build();

                    studentRequests.add(createRequest);
                    requestRowMap.put(createRequest, rowNum);

                } catch (Exception e) {
                    // Record error and continue with next row
                    BatchImportStudentResponse.ImportError error = BatchImportStudentResponse.ImportError.builder()
                            .rowNumber(rowNum)
                            .email(getCellValue(row.getCell(COL_EMAIL)))
                            .errorMessage(e.getMessage())
                            .field(getErrorField(e))
                            .build();
                    errors.add(error);
                    log.warn("Failed to parse student from row {}: {}", rowNum, e.getMessage());
                }
            }

            // Second pass: Process valid requests
            for (CreateStudentRequest createRequest : studentRequests) {
                int currentRow = requestRowMap.get(createRequest);

                try {
                    // Use the existing teacherService to create student
                    // This will handle all the logic including:
                    // 1. Email uniqueness check (again, just in case)
                    // 2. Student creation with auto-generated password
                    // 3. Parent invitation if contact email provided
                    // 4. Email sending (async)
                    teacherService.createStudent(createRequest);

                    successfulImports++;
                    log.info("Successfully imported student from row {}: {}", currentRow, createRequest.getEmail());

                } catch (Exception e) {
                    // Record error and continue with next student
                    BatchImportStudentResponse.ImportError error = BatchImportStudentResponse.ImportError.builder()
                            .rowNumber(currentRow)
                            .email(createRequest.getEmail())
                            .errorMessage(e.getMessage())
                            .field(getErrorField(e))
                            .build();
                    errors.add(error);
                    log.warn("Failed to create student from row {}: {}", currentRow, e.getMessage());
                }
            }
        }

        log.info("Batch import completed: {} successful, {} failed out of {} total rows",
                successfulImports, errors.size(), totalRows);

        return BatchImportStudentResponse.builder()
                .totalRows(totalRows)
                .successfulImports(successfulImports)
                .failedImports(errors.size())
                .errors(errors)
                .build();
    }

    @Override
    public void validateImportFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".xlsx")) {
            throw new BadRequestException("Only .xlsx files are supported");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size must be less than 10MB");
        }
    }

    private void validateTeacherHasClassAccess(Class classEntity, Teacher teacher) {
        if (!classEntity.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ForbiddenException("You do not have access to this class");
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < HEADERS.length; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellValue(cell).trim();
                if (!value.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private StudentRowData parseStudentRow(Row row, int rowNum) {
        StudentRowData rowData = new StudentRowData();

        try {
            // Email (required)
            Cell emailCell = row.getCell(COL_EMAIL);
            if (emailCell == null) {
                throw new BadRequestException("Email is required");
            }
            String email = getCellValue(emailCell).trim();
            if (email.isEmpty()) {
                throw new BadRequestException("Email is required");
            }
            rowData.setEmail(email);

            // Full Name (required)
            Cell fullNameCell = row.getCell(COL_FULL_NAME);
            if (fullNameCell == null) {
                throw new BadRequestException("Full name is required");
            }
            String fullName = getCellValue(fullNameCell).trim();
            if (fullName.isEmpty()) {
                throw new BadRequestException("Full name is required");
            }
            rowData.setFullName(fullName);

            // Phone (optional)
            Cell phoneCell = row.getCell(COL_PHONE);
            if (phoneCell != null) {
                String phone = getCellValue(phoneCell).trim();
                rowData.setPhone(phone.isEmpty() ? null : phone);
            }

            // Date of Birth (optional)
            Cell dobCell = row.getCell(COL_DATE_OF_BIRTH);
            if (dobCell != null) {
                String dobStr = getCellValue(dobCell).trim();
                if (!dobStr.isEmpty()) {
                    try {
                        rowData.setDateOfBirth(parseDate(dobStr));
                    } catch (DateTimeParseException e) {
                        throw new BadRequestException("Invalid date format for Date of Birth. Use MM/DD/YYYY");
                    }
                }
            }

            // Gender (required)
            Cell genderCell = row.getCell(COL_GENDER);
            if (genderCell == null) {
                throw new BadRequestException("Gender is required");
            }
            String genderStr = getCellValue(genderCell).trim().toUpperCase();
            if (genderStr.isEmpty()) {
                throw new BadRequestException("Gender is required");
            }
            try {
                rowData.setGender(Gender.valueOf(genderStr));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid gender. Must be MALE, FEMALE, or OTHER");
            }

            // Address (optional)
            Cell addressCell = row.getCell(COL_ADDRESS);
            if (addressCell != null) {
                String address = getCellValue(addressCell).trim();
                rowData.setAddress(address.isEmpty() ? null : address);
            }

            // Enrollment Date (optional)
            Cell enrollmentCell = row.getCell(COL_ENROLLMENT_DATE);
            if (enrollmentCell != null) {
                String enrollmentStr = getCellValue(enrollmentCell).trim();
                if (!enrollmentStr.isEmpty()) {
                    try {
                        rowData.setEnrollmentDate(parseDate(enrollmentStr));
                    } catch (DateTimeParseException e) {
                        throw new BadRequestException("Invalid date format for Enrollment Date. Use MM/DD/YYYY");
                    }
                }
            }

            // Parent Email (optional)
            Cell parentEmailCell = row.getCell(COL_PARENT_EMAIL);
            if (parentEmailCell != null) {
                String parentEmail = getCellValue(parentEmailCell).trim();
                rowData.setParentEmail(parentEmail.isEmpty() ? null : parentEmail);
            }

        } catch (Exception e) {
            throw new BadRequestException("Row " + rowNum + ": " + e.getMessage());
        }

        return rowData;
    }

    private void validateStudentRow(StudentRowData rowData, int rowNum) {
        // Email validation
        if (rowData.getEmail() == null || rowData.getEmail().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        if (!rowData.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new BadRequestException("Invalid email format");
        }

        // Full name validation
        if (rowData.getFullName() == null || rowData.getFullName().isEmpty()) {
            throw new BadRequestException("Full name is required");
        }
        if (rowData.getFullName().length() > 255) {
            throw new BadRequestException("Full name must not exceed 255 characters");
        }

        // Phone validation (if provided)
        if (rowData.getPhone() != null && !rowData.getPhone().isEmpty()) {
            if (!rowData.getPhone().matches("\\d{10,11}")) {
                throw new BadRequestException("Invalid phone number format (10-11 digits required)");
            }
        }

        // Note: We don't check email uniqueness here because teacherService.createStudent() will do it
        // This allows us to handle duplicate emails in the same batch file gracefully
    }

    private String getCellValue(Cell cell) {
        if (cell == null) {
            return "";
        }

        DataFormatter formatter = new DataFormatter();

        // For date cells, we need to handle them specially
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            // Create a date formatter with MM/dd/yyyy pattern
            CreationHelper createHelper = cell.getSheet().getWorkbook().getCreationHelper();
            CellStyle dateStyle = cell.getSheet().getWorkbook().createCellStyle();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("MM/dd/yyyy"));

            // Temporarily apply the style to get formatted value
            CellStyle originalStyle = cell.getCellStyle();
            cell.setCellStyle(dateStyle);
            String formattedDate = formatter.formatCellValue(cell);
            cell.setCellStyle(originalStyle);

            return formattedDate;
        }

        // For all other cells, use DataFormatter
        return formatter.formatCellValue(cell).trim();
    }
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }

        String trimmed = dateStr.trim();

        // First, try the expected format MM/dd/yyyy
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
            return LocalDate.parse(trimmed, formatter);
        } catch (DateTimeParseException e1) {
            // If that fails, try with single digits (M/d/yyyy)
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yyyy");
                return LocalDate.parse(trimmed, formatter);
            } catch (DateTimeParseException e2) {
                // If that fails, check if it's a numeric date with slashes
                if (trimmed.matches("\\d{1,2}/\\d{1,2}/\\d{4}")) {
                    String[] parts = trimmed.split("/");
                    int first = Integer.parseInt(parts[0]);
                    int second = Integer.parseInt(parts[1]);
                    int year = Integer.parseInt(parts[2]);

                    // Smart detection: Assume MM/DD if first <= 12
                    // Vietnamese context: Most dates will be MM/DD
                    if (first <= 12 && second <= 31) {
                        return LocalDate.of(year, first, second);
                    }
                    // Otherwise try DD/MM
                    else if (second <= 12 && first <= 31) {
                        return LocalDate.of(year, second, first);
                    }
                }

                // Last resort: Try ISO format (Excel might export this)
                try {
                    return LocalDate.parse(trimmed, DateTimeFormatter.ISO_LOCAL_DATE);
                } catch (DateTimeParseException e3) {
                    throw new DateTimeParseException(
                            "Invalid date format. Please use MM/DD/YYYY format. Example: 01/15/2010",
                            trimmed, 0
                    );
                }
            }
        }
    }
    private String getErrorField(Exception e) {
        String message = e.getMessage();
        if (message.contains("Email") || message.contains("email")) return "Email";
        if (message.contains("Full name") || message.contains("Full Name") || message.contains("full name")) return "Full Name";
        if (message.contains("Phone") || message.contains("phone")) return "Phone";
        if (message.contains("Date of Birth") || message.contains("date of birth")) return "Date of Birth";
        if (message.contains("Gender") || message.contains("gender")) return "Gender";
        if (message.contains("Enrollment Date") || message.contains("enrollment date")) return "Enrollment Date";
        if (message.contains("Parent Email") || message.contains("parent email") || message.contains("Contact")) return "Parent Email";
        return "General";
    }

    // Helper class to hold parsed row data
    @Getter
    @Setter
    private static class StudentRowData {
        private String email;
        private String fullName;
        private String phone;
        private LocalDate dateOfBirth;
        private Gender gender;
        private String address;
        private LocalDate enrollmentDate;
        private String parentEmail;
    }
}