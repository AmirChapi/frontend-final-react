// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   Paper,
//   MenuItem,
//   Snackbar,
//   Alert,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle
// } from "@mui/material";
// import { useNavigate, useLocation } from "react-router-dom";

// export default function GradeForm() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const gradeToEdit = location.state?.gradeToEdit || null;

//   const initialValues = {
//     idNumber: "",
//     taskCode: "",
//     taskGrade: "",
//     taskName: "",
//   };

//   const [formData, setFormData] = useState(initialValues);
//   const [students, setStudents] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [openSnackbar, setOpenSnackbar] = useState(false);
//   const [error, setError] = useState("");
//   const [openCancelDialog, setOpenCancelDialog] = useState(false);

//   useEffect(() => {
//     const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
//     const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     setStudents(storedStudents);
//     setTasks(storedTasks);
//     if (gradeToEdit) {
//       setFormData({ ...gradeToEdit });
//     }
//   }, [gradeToEdit]);

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     let newFormData = { ...formData, [name]: value };

//     if (name === "taskName") {
//       const selectedTask = tasks.find(task => task.taskName === value);
//       if (selectedTask) {
//         newFormData.taskCode = selectedTask.taskCode || "";
//       } else {
//         newFormData.taskCode = "";
//       }
//     }

//     setFormData(newFormData);

//     let errorField = false;

//     if (name === "taskGrade") {
//       const num = Number(value);
//       errorField = value !== "" && (!Number.isInteger(num) || num < 0 || num > 100);
//     }

//     if (name === "idNumber") {
//       errorField = !value;
//     }

//     if (name === "taskName") {
//       errorField = !value;
//     }

//     setErrors((prev) => ({ ...prev, [name]: errorField }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     let hasError = false;
//     const newErrors = {};

//     const grade = Number(formData.taskGrade);

//     if (!formData.idNumber) {
//       newErrors.idNumber = true;
//       hasError = true;
//     }

//     if (!formData.taskName) {
//       newErrors.taskName = true;
//       hasError = true;
//     }

//     if (!(formData.taskGrade !== "" && !isNaN(grade) && grade >= 0 && grade <= 100)) {
//       newErrors.taskGrade = true;
//       hasError = true;
//     }

//     if (hasError) {
//       setErrors(newErrors);
//       return;
//     }

//     const existingGrades = JSON.parse(localStorage.getItem("grades")) || [];

//     const isDuplicate = existingGrades.some(
//       (g) =>
//         g.idNumber === formData.idNumber &&
//         g.taskName === formData.taskName &&
//         (!gradeToEdit ||
//           g.idNumber !== gradeToEdit.idNumber ||
//           g.taskName !== gradeToEdit.taskName)
//     );

//     if (isDuplicate) {
//       setError("This student already has a grade for this task.");
//       return;
//     }

//     const updatedGrades = gradeToEdit
//       ? existingGrades.map((g) =>
//           g.idNumber === gradeToEdit.idNumber && g.taskName === gradeToEdit.taskName
//             ? formData
//             : g
//         )
//       : [...existingGrades, formData];

//     localStorage.setItem("grades", JSON.stringify(updatedGrades));
//     setOpenSnackbar(true);
//     setTimeout(() => navigate("/GradeManage"), 1000);
//   };

//   const handleCloseSnackbar = () => {
//     setOpenSnackbar(false);
//   };

//   const handleCancelClick = () => {
//     setOpenCancelDialog(true);
//   };

//   const handleConfirmCancel = () => {
//     setOpenCancelDialog(false);
//     navigate("/GradeManage");
//   };

//   const handleCloseCancelDialog = () => {
//     setOpenCancelDialog(false);
//   };

//   return (
//     <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
//       <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
//         <Typography variant="h5" align="center" gutterBottom>
//           {gradeToEdit ? "Edit Grade" : "New Grade Entry"}
//         </Typography>
//         <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           <TextField
//             select
//             id="idNumber"
//             name="idNumber"
//             label="Student ID"
//             value={formData.idNumber}
//             onChange={handleChange}
//             fullWidth
//             disabled={!!gradeToEdit}
//             error={errors.idNumber}
//             helperText={errors.idNumber ? "Student ID is required" : ""}
//           >
//             {students.map((student) => (
//               <MenuItem key={student.studentId} value={student.studentId}>
//                 {student.studentId} - {student.fullName}
//               </MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             id="taskGrade"
//             name="taskGrade"
//             label="Task Grade"
//             type="number"
//             value={formData.taskGrade}
//             onChange={handleChange}
//             fullWidth
//             error={errors.taskGrade}
//             helperText={errors.taskGrade ? "Grade must be a number between 0 and 100" : ""}
//           />

//           <TextField
//             select
//             id="taskName"
//             name="taskName"
//             label="Task Name"
//             value={formData.taskName}
//             onChange={handleChange}
//             fullWidth
//             disabled={!!gradeToEdit}
//             error={errors.taskName}
//             helperText={errors.taskName ? "Task name is required" : ""}
//           >
//             {tasks.map((task) => (
//               <MenuItem key={task.taskName} value={task.taskName}>
//                 {task.taskName}
//               </MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             id="taskCode"
//             name="taskCode"
//             label="Task Code"
//             value={formData.taskCode}
//             fullWidth
//             disabled
//             helperText="Task code is selected automatically"
//           />

//           {error && (
//             <Typography color="error" fontSize="0.9rem">
//               {error}
//             </Typography>
//           )}

//           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Button variant="outlined" onClick={handleCancelClick} color="secondary">
//               Cancel
//             </Button>
//             <Button type="submit" variant="contained" color="primary">
//               Save
//             </Button>
//           </Box>
//         </Box>
//       </Paper>
//       <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
//         <Alert severity="success" sx={{ width: '100%' }} onClose={handleCloseSnackbar}>
//           Grade successfully saved!
//         </Alert>
//       </Snackbar>
//       <Dialog
//         open={openCancelDialog}
//         onClose={handleCloseCancelDialog}
//         aria-labelledby="cancel-dialog-title"
//         aria-describedby="cancel-dialog-description"
//       >
//         <DialogTitle id="cancel-dialog-title">Confirm Cancellation</DialogTitle>
//         <DialogContent>
//           <DialogContentText id="cancel-dialog-description">
//             Are you sure you want to cancel? Unsaved changes will be lost.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseCancelDialog} color="primary">
//             No
//           </Button>
//           <Button onClick={handleConfirmCancel} color="secondary" autoFocus>
//             Yes, Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

// GradeForm.jsx - הוספת/עריכת ציון לפי סטודנט ומטלה
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function GradeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const gradeToEdit = location.state?.gradeToEdit || null;

  const initialValues = {
    idNumber: "",
    taskCode: "",
    taskGrade: "",
  };

  const [formData, setFormData] = useState(initialValues);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setStudents(storedStudents);
    setTasks(storedTasks);
    if (gradeToEdit) {
      setFormData({ ...gradeToEdit });
    }
  }, [gradeToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let errorField = false;
    const grade = Number(value);

    if (name === "taskGrade") {
      errorField = value === "" || isNaN(grade) || grade < 0 || grade > 100;
    } else {
      errorField = !value;
    }

    setErrors(prev => ({ ...prev, [name]: errorField }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    if (!formData.idNumber) {
      newErrors.idNumber = true;
      hasError = true;
    }

    if (!formData.taskCode) {
      newErrors.taskCode = true;
      hasError = true;
    }

    const grade = Number(formData.taskGrade);
    if (formData.taskGrade === "" || isNaN(grade) || grade < 0 || grade > 100) {
      newErrors.taskGrade = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const existingGrades = JSON.parse(localStorage.getItem("grades")) || [];
    const isDuplicate = existingGrades.some(
      (g) =>
        g.idNumber === formData.idNumber &&
        g.taskCode === formData.taskCode &&
        (!gradeToEdit ||
          g.idNumber !== gradeToEdit.idNumber ||
          g.taskCode !== gradeToEdit.taskCode)
    );

    if (isDuplicate) {
      setError("This student already has a grade for this task.");
      return;
    }

    const updatedGrades = gradeToEdit
      ? existingGrades.map((g) =>
          g.idNumber === gradeToEdit.idNumber && g.taskCode === gradeToEdit.taskCode
            ? formData
            : g
        )
      : [...existingGrades, formData];

    localStorage.setItem("grades", JSON.stringify(updatedGrades));
    setOpenSnackbar(true);
    setTimeout(() => navigate("/GradeManage"), 1000);
  };

  const handleCancelClick = () => {
    setOpenCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate("/GradeManage");
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  return (
    <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {gradeToEdit ? "Edit Grade" : "Add New Grade"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Student"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            fullWidth
            disabled={!!gradeToEdit}
            error={errors.idNumber}
            helperText={errors.idNumber ? "Student is required" : ""}
          >
            {students.map((s) => (
              <MenuItem key={s.studentId} value={s.studentId}>
                {s.studentId} - {s.fullName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Task"
            name="taskCode"
            value={formData.taskCode}
            onChange={handleChange}
            fullWidth
            disabled={!!gradeToEdit}
            error={errors.taskCode}
            helperText={errors.taskCode ? "Task is required" : ""}
          >
            {tasks.map((t) => (
              <MenuItem key={t.taskCode} value={t.taskCode}>
                {t.taskCode} - {t.taskName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Grade (0-100)"
            name="taskGrade"
            type="number"
            value={formData.taskGrade}
            onChange={handleChange}
            fullWidth
            error={errors.taskGrade}
            helperText={errors.taskGrade ? "Enter a valid grade between 0-100" : ""}
          />

          {error && (
            <Typography color="error" fontSize="0.9rem">
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" onClick={handleCancelClick} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: "100%" }}>
          Grade saved successfully!
        </Alert>
      </Snackbar>

      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel? Unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>No</Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
