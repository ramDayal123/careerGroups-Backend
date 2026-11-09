
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as QRCode from 'qrcode';

import { ApiService } from 'src/app/services/api-services';

// ==========================================
// INTERFACES
// ==========================================

interface Exam {
  name: string;
  fullMarks: number;
  obtained: number;
}

interface Certificate {
  _id?: string;
  id?: string;
  serialNo: string;
  registrationNo: string;
  studentName: string;
  fatherName: string;
  course: string;
  duration: string;
  trainingCenter: string;
  session: string;
  issueDate: string;
  photo: string;
  modules: string[];
  exams: Exam[];
}

type PdfColor = [number, number, number];

// ==========================================
// COMPONENT
// ==========================================

@Component({
  selector: 'app-all-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-certificate.component.html',
  styleUrls: ['./all-certificate.component.css']
})
export class AllCertificateComponent implements OnInit {

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  private readonly GET_API =
    '/certificate/getDatacertificate';

  private readonly CREATE_API =
    '/certificate/addDatacertificate';

  private readonly UPDATE_API =
    '/certificate/updateDatacertificate';

  private readonly DELETE_API =
    '/certificate/deleteDatacertificate';

  // ==========================================
  // PDF COLORS
  // ==========================================

  private readonly PDF_COLORS = {
    purple: [83, 58, 165] as PdfColor,
    blue: [0, 103, 244] as PdfColor,
    gold: [190, 145, 55] as PdfColor,
    dark: [35, 42, 65] as PdfColor,
    grey: [105, 115, 130] as PdfColor,
    light: [247, 248, 253] as PdfColor,
    white: [255, 255, 255] as PdfColor
  };

  // ==========================================
  // VARIABLES
  // ==========================================

  certificates: Certificate[] = [];

  selectedCertificate: Certificate | null = null;

  form: Certificate = this.getEmptyForm();

  showForm = false;
  isEditing = false;

  loading = false;
  saving = false;

  deletingId: string | null = null;

  searchTerm = '';

  successMessage = '';
  apiError = '';

  constructor(private api: ApiService) {}

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.getCertificates();
  }

  // ==========================================
  // EMPTY FORM
  // ==========================================

  private getEmptyForm(): Certificate {
    return {
      serialNo: '',
      registrationNo: '',
      studentName: '',
      fatherName: '',
      course: 'ADCA',
      duration: '6 MONTH',
      trainingCenter: 'Career Groups Of Computer Education',
      session: '2026 - 2027',
      issueDate: this.getTodayDate(),
      photo: '',

      modules: [
        'Notepad, Fundamentals, MS Office, HTML, Internet, MS DOS'
      ],

      exams: [
        {
          name: 'Written Examination',
          fullMarks: 100,
          obtained: 0
        }
      ]
    };
  }

  // ==========================================
  // TODAY DATE
  // ==========================================

  private getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // GET ALL CERTIFICATES
  // ==========================================

  getCertificates(): void {

    this.loading = true;
    this.apiError = '';

    this.api.get(this.GET_API).subscribe({

      next: (response: any) => {

        console.log('CERTIFICATE API RESPONSE:', response);

        let records: any[] = [];

        if (Array.isArray(response)) {
          records = response;

        } else if (Array.isArray(response?.data)) {
          records = response.data;

        } else if (Array.isArray(response?.certificates)) {
          records = response.certificates;

        } else if (Array.isArray(response?.data?.certificates)) {
          records = response.data.certificates;

        } else if (Array.isArray(response?.result)) {
          records = response.result;
        }

        this.certificates = records.map(item =>
          this.normalizeCertificate(item)
        );

        const selectedId = this.getId(this.selectedCertificate);

        if (this.certificates.length > 0) {

          this.selectedCertificate =
            this.certificates.find(
              item => this.getId(item) === selectedId
            ) || this.certificates[0];

        } else {

          this.selectedCertificate = null;
        }

        this.loading = false;

        console.log(
          'NORMALIZED CERTIFICATES:',
          this.certificates
        );
      },

      error: (error: any) => {

        console.error('GET CERTIFICATE ERROR:', error);

        this.apiError =
          error?.error?.message ||
          error?.message ||
          'Unable to load certificates. Please check your API server.';

        this.certificates = [];
        this.selectedCertificate = null;
        this.loading = false;
      }
    });
  }

  // ==========================================
  // NORMALIZE API DATA
  // ==========================================

  private normalizeCertificate(item: any): Certificate {

    return {
      _id: item._id || item.id || '',
      id: item.id || item._id || '',

      serialNo: item.serialNo || '',
      registrationNo: item.registrationNo || '',
      studentName: item.studentName || '',
      fatherName: item.fatherName || '',

      course: item.course || '',
      duration: item.duration || '',
      trainingCenter: item.trainingCenter || '',
      session: item.session || '',

      issueDate: item.issueDate
        ? String(item.issueDate).substring(0, 10)
        : '',

      photo: item.photo || '',

      modules: Array.isArray(item.modules)
        ? item.modules.map((module: any) =>
            typeof module === 'string'
              ? module
              : module?.name || ''
          )
        : [],

      exams: Array.isArray(item.exams)
        ? item.exams.map((exam: any) => ({
            name: exam.name || exam.subject || '',
            fullMarks: Number(exam.fullMarks) || 0,
            obtained: Number(
              exam.obtained ?? exam.obtainedMarks
            ) || 0
          }))
        : []
    };
  }

  // ==========================================
  // GET ID
  // ==========================================

  private getId(certificate: Certificate | null): string {
    return certificate?._id || certificate?.id || '';
  }

  // ==========================================
  // TOTAL CERTIFICATES
  // ==========================================

  get totalCertificates(): number {
    return this.certificates.length;
  }

  // ==========================================
  // CREATE CERTIFICATE
  // ==========================================

  createCertificate(): void {

    this.form = this.getEmptyForm();

    this.isEditing = false;
    this.showForm = true;
    this.selectedCertificate = null;

    this.apiError = '';
    this.successMessage = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeForm(): void {

    this.showForm = false;
    this.isEditing = false;
    this.apiError = '';
  }

  // ==========================================
  // SAVE CERTIFICATE
  // ==========================================

  saveCertificate(certificateForm: NgForm): void {

    if (certificateForm.invalid) {

      certificateForm.control.markAllAsTouched();

      this.apiError = 'Please fill all required fields.';

      return;
    }

    if (!this.form.exams.length) {

      this.apiError =
        'Please add at least one examination.';

      return;
    }

    const invalidExam = this.form.exams.some(exam =>

      !exam.name.trim() ||

      !Number.isFinite(Number(exam.fullMarks)) ||

      Number(exam.fullMarks) <= 0 ||

      !Number.isFinite(Number(exam.obtained)) ||

      Number(exam.obtained) < 0 ||

      Number(exam.obtained) > Number(exam.fullMarks)
    );

    if (invalidExam) {

      this.apiError =
        'Enter valid examination marks. Obtained marks cannot exceed full marks.';

      return;
    }

    if (
      !this.form.modules.length ||
      this.form.modules.every(module => !module.trim())
    ) {

      this.apiError =
        'Please add at least one course module.';

      return;
    }

    const editingId = this.isEditing
      ? this.getId(this.selectedCertificate)
      : '';

    const duplicate = this.certificates.some(item =>

      item.serialNo.trim().toLowerCase() ===
      this.form.serialNo.trim().toLowerCase() &&

      this.getId(item) !== editingId
    );

    if (duplicate) {

      this.apiError = 'Serial number already exists.';

      return;
    }

    this.saving = true;
    this.apiError = '';
    this.successMessage = '';

    const payload = this.preparePayload();

    // UPDATE
    if (this.isEditing) {

      if (!editingId) {

        this.apiError = 'Certificate ID is missing.';
        this.saving = false;

        return;
      }

      this.api.put(
        `${this.UPDATE_API}/${editingId}`,
        payload
      ).subscribe({

        next: (response: any) => {

          this.successMessage =
            response?.message ||
            'Certificate updated successfully.';

          this.saving = false;
          this.showForm = false;
          this.isEditing = false;

          this.getCertificates();
        },

        error: (error: any) => {

          console.error('UPDATE CERTIFICATE ERROR:', error);

          this.apiError =
            error?.error?.message ||
            'Unable to update certificate.';

          this.saving = false;
        }
      });

    } else {

      // CREATE
      this.api.post(
        this.CREATE_API,
        payload
      ).subscribe({

        next: (response: any) => {

          this.successMessage =
            response?.message ||
            'Certificate created successfully.';

          this.saving = false;
          this.showForm = false;
          this.isEditing = false;

          this.getCertificates();
        },

        error: (error: any) => {

          console.error('CREATE CERTIFICATE ERROR:', error);

          this.apiError =
            error?.error?.message ||
            'Unable to create certificate.';

          this.saving = false;
        }
      });
    }
  }

  // ==========================================
  // MONGODB PAYLOAD
  // ==========================================

  private preparePayload(): any {

    return {
      serialNo: this.form.serialNo.trim(),
      registrationNo: this.form.registrationNo.trim(),
      studentName: this.form.studentName.trim(),
      fatherName: this.form.fatherName.trim(),

      course: this.form.course.trim(),
      duration: this.form.duration,
      trainingCenter: this.form.trainingCenter,
      session: this.form.session,

      issueDate: this.form.issueDate,
      photo: this.form.photo,

      modules: this.form.modules.filter(
        module => module.trim() !== ''
      ),

      exams: this.form.exams.map(exam => ({

        subject: exam.name.trim(),

        fullMarks: Number(exam.fullMarks),

        obtainedMarks: Number(exam.obtained)
      }))
    };
  }

  // ==========================================
  // EDIT CERTIFICATE
  // ==========================================

  editCertificate(certificate: Certificate): void {

    this.form = {
      ...certificate,

      modules: [...certificate.modules],

      exams: certificate.exams.map(
        exam => ({ ...exam })
      )
    };

    this.selectedCertificate = certificate;

    this.isEditing = true;
    this.showForm = true;

    this.apiError = '';
    this.successMessage = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ==========================================
  // PREVIEW CERTIFICATE
  // ==========================================

  previewCertificate(certificate: Certificate): void {

    this.selectedCertificate = certificate;

    this.showForm = false;

    this.apiError = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ==========================================
  // DELETE CERTIFICATE
  // ==========================================

  deleteCertificate(certificate: Certificate): void {

    const id = this.getId(certificate);

    if (!id) {

      this.apiError = 'Certificate ID not found.';

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete certificate ${certificate.serialNo}?`
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = id;

    this.apiError = '';
    this.successMessage = '';

    this.api.delete(
      `${this.DELETE_API}/${id}`
    ).subscribe({

      next: (response: any) => {

        this.successMessage =
          response?.message ||
          'Certificate deleted successfully.';

        this.deletingId = null;

        if (this.getId(this.selectedCertificate) === id) {
          this.selectedCertificate = null;
        }

        this.getCertificates();
      },

      error: (error: any) => {

        console.error('DELETE CERTIFICATE ERROR:', error);

        this.apiError =
          error?.error?.message ||
          'Unable to delete certificate.';

        this.deletingId = null;
      }
    });
  }

  // ==========================================
  // MODULES
  // ==========================================

  addModule(): void {
    this.form.modules.push('');
  }

  removeModule(index: number): void {
    this.form.modules.splice(index, 1);
  }

  // ==========================================
  // EXAMS
  // ==========================================

  addExam(): void {

    this.form.exams.push({
      name: '',
      fullMarks: 100,
      obtained: 0
    });
  }

  removeExam(index: number): void {
    this.form.exams.splice(index, 1);
  }

  // ==========================================
  // PHOTO UPLOAD
  // ==========================================

  onPhotoSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {

      this.apiError = 'Please select a valid image.';

      input.value = '';

      return;
    }

    const maxSize = 1.5 * 1024 * 1024;

    if (file.size > maxSize) {

      this.apiError =
        'Image size must be less than 1.5 MB.';

      input.value = '';

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      this.form.photo = reader.result as string;

      this.apiError = '';
    };

    reader.onerror = () => {

      this.apiError =
        'Unable to read selected image.';
    };

    reader.readAsDataURL(file);
  }

  // ==========================================
  // REMOVE PHOTO
  // ==========================================

  removePhoto(): void {
    this.form.photo = '';
  }

  // ==========================================
  // FORM CALCULATIONS
  // ==========================================

  get totalMarks(): number {

    return this.form.exams.reduce(
      (total, exam) =>
        total + Number(exam.fullMarks || 0),
      0
    );
  }

  get obtainedMarks(): number {

    return this.form.exams.reduce(
      (total, exam) =>
        total + Number(exam.obtained || 0),
      0
    );
  }

  get percentage(): number {

    if (this.totalMarks <= 0) {
      return 0;
    }

    return (
      this.obtainedMarks / this.totalMarks
    ) * 100;
  }

  get grade(): string {
    return this.getGrade(this.percentage);
  }

  // ==========================================
  // SELECTED CERTIFICATE CALCULATIONS
  // ==========================================

  get selectedTotalMarks(): number {

    return this.calculateTotal(
      this.selectedCertificate?.exams || [],
      'fullMarks'
    );
  }

  get selectedObtainedMarks(): number {

    return this.calculateTotal(
      this.selectedCertificate?.exams || [],
      'obtained'
    );
  }

  get selectedPercentage(): number {

    if (this.selectedTotalMarks <= 0) {
      return 0;
    }

    return (
      this.selectedObtainedMarks /
      this.selectedTotalMarks
    ) * 100;
  }

  get selectedGrade(): string {
    return this.getGrade(this.selectedPercentage);
  }

  // ==========================================
  // COMMON CALCULATIONS
  // ==========================================

  private calculateTotal(
    exams: Exam[],
    field: 'fullMarks' | 'obtained'
  ): number {

    return exams.reduce(
      (total, exam) =>
        total + Number(exam[field] || 0),
      0
    );
  }

  private getGrade(percentage: number): string {

    if (percentage >= 86) return 'A+';
    if (percentage >= 71) return 'A';
    if (percentage >= 56) return 'B';
    if (percentage >= 41) return 'C';
    if (percentage >= 33) return 'D';

    return 'F';
  }

  // ==========================================
  // SEARCH
  // ==========================================

  get filteredCertificates(): Certificate[] {

    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.certificates;
    }

    return this.certificates.filter(certificate =>

      certificate.serialNo.toLowerCase().includes(search) ||

      certificate.registrationNo.toLowerCase().includes(search) ||

      certificate.studentName.toLowerCase().includes(search) ||

      certificate.fatherName.toLowerCase().includes(search) ||

      certificate.course.toLowerCase().includes(search)
    );
  }

  // ==========================================
  // TRACK BY
  // ==========================================

  trackById(index: number, item: Certificate): string {

    return this.getId(item) || index.toString();
  }

  // ==========================================
  // DATE FORMAT
  // ==========================================

  formatDate(date: string): string {

    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  // ==========================================
  // PDF IMAGE LOADER
  // ==========================================

  private loadPdfImage(path: string): Promise<string> {

    return new Promise((resolve, reject) => {

      const image = new Image();

      image.onload = () => {

        try {

          const canvas = document.createElement('canvas');

          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;

          const context = canvas.getContext('2d');

          if (!context) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          context.drawImage(image, 0, 0);

          const format = path.toLowerCase().endsWith('.png')
            ? 'image/png'
            : 'image/jpeg';

          resolve(canvas.toDataURL(format, 0.95));

        } catch (error) {

          reject(error);
        }
      };

      image.onerror = () => {

        reject(new Error(`Image not found: ${path}`));
      };

      image.src = path;
    });
  }

  // ==========================================
  // DECORATIVE LINE
  // ==========================================

  private drawDecorativeLine(
    pdf: jsPDF,
    x1: number,
    y: number,
    x2: number
  ): void {

    const gold = this.PDF_COLORS.gold;
    const purple = this.PDF_COLORS.purple;

    pdf.setDrawColor(...gold);
    pdf.setLineWidth(0.7);

    pdf.line(x1, y, x2, y);

    pdf.setDrawColor(...purple);
    pdf.setLineWidth(0.25);

    pdf.line(x1, y + 1.5, x2, y + 1.5);

    pdf.setFillColor(...gold);

    pdf.circle(x1, y + 0.75, 1, 'F');
    pdf.circle(x2, y + 0.75, 1, 'F');
  }

  // ==========================================
  // PAGE BORDER + WATERMARK
  // ==========================================

  private drawPageDecoration(pdf: jsPDF): void {

    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    const purple = this.PDF_COLORS.purple;
    const gold = this.PDF_COLORS.gold;

    // Outer border
    pdf.setDrawColor(...purple);
    pdf.setLineWidth(1.1);

    pdf.roundedRect(
      6, 6,
      width - 12,
      height - 12,
      3, 3,
      'S'
    );

    // Inner border
    pdf.setDrawColor(...gold);
    pdf.setLineWidth(0.35);

    pdf.rect(
      10, 10,
      width - 20,
      height - 20
    );

    // Corner ornaments
    const corners: [number, number][] = [
      [13, 13],
      [width - 13, 13],
      [13, height - 13],
      [width - 13, height - 13]
    ];

    pdf.setDrawColor(...gold);
    pdf.setLineWidth(0.8);

    corners.forEach(([x, y]) => {
      pdf.circle(x, y, 1.5, 'S');
    });

    // CG watermark
    pdf.setTextColor(241, 240, 249);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(90);

    pdf.text(
      'CG',
      width / 2,
      height / 2 + 15,
      {
        align: 'center',
        angle: -35
      }
    );

    // Institute watermark
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(244, 243, 249);

    pdf.text(
      'CAREER GROUPS',
      width / 2,
      height / 2 + 32,
      { align: 'center' }
    );
  }

  // ==========================================
  // SECTION HEADING
  // ==========================================

  private drawSectionHeading(
    pdf: jsPDF,
    title: string,
    y: number
  ): number {

    const width = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(...this.PDF_COLORS.purple);

    pdf.roundedRect(
      15, y,
      width - 30,
      10,
      2, 2,
      'F'
    );

    pdf.setDrawColor(...this.PDF_COLORS.gold);
    pdf.setLineWidth(0.6);

    pdf.line(
      17, y + 10,
      width - 17, y + 10
    );

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);

    pdf.text(
      title.toUpperCase(),
      20,
      y + 6.7
    );

    return y + 15;
  }

  // ==========================================
  // PDF HEADER
  // ==========================================

  private drawPdfHeader(
    pdf: jsPDF,
    certificate: Certificate,
    logo: string
  ): void {

    const width = pdf.internal.pageSize.getWidth();

    const purple = this.PDF_COLORS.purple;
    const blue = this.PDF_COLORS.blue;

    // Institute logo
    if (logo) {

      const imageType = logo.startsWith('data:image/png')
        ? 'PNG'
        : 'JPEG';

      pdf.addImage(
        logo,
        imageType,
        16, 14,
        25, 25
      );

    } else {

      pdf.setFillColor(...purple);

      pdf.roundedRect(
        16, 14,
        25, 25,
        3, 3,
        'F'
      );

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('times', 'bold');
      pdf.setFontSize(17);

      pdf.text(
        'CG',
        28.5,
        30,
        { align: 'center' }
      );
    }

    // Institute name
    pdf.setTextColor(...purple);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(20);

    pdf.text(
      'CAREER GROUPS',
      width / 2,
      19,
      { align: 'center' }
    );

    // Subtitle
    pdf.setTextColor(...blue);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);

    pdf.text(
      'OF COMPUTER EDUCATION',
      width / 2,
      25,
      { align: 'center' }
    );

    // ISO line
    pdf.setTextColor(...this.PDF_COLORS.grey);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);

    pdf.text(
      'An ISO 9001:2015 Certified Company',
      width / 2,
      30,
      { align: 'center' }
    );

    pdf.text(
      'www.careergroups.in | info@careergroups.info',
      width / 2,
      35,
      { align: 'center' }
    );

    // Serial number
    pdf.setFillColor(...blue);

    pdf.roundedRect(
      width - 57,
      14,
      40,
      10,
      2, 2,
      'F'
    );

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);

    const serialText = pdf.splitTextToSize(
      `NO: ${certificate.serialNo}`,
      36
    );

    pdf.text(
      serialText,
      width - 37,
      20.5,
      { align: 'center' }
    );

    // Decorative separator
    this.drawDecorativeLine(
      pdf,
      15,
      43,
      width - 15
    );

    // Main certificate title
    pdf.setFillColor(...purple);

    pdf.roundedRect(
      29, 48,
      width - 58,
      13,
      3, 3,
      'F'
    );

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(14);

    pdf.text(
      'GRADE CARD / RESULT SHEET',
      width / 2,
      56.5,
      { align: 'center' }
    );
  }

  // ==========================================
  // STUDENT INFORMATION CARD
  // ==========================================

  private drawStudentCard(
    pdf: jsPDF,
    certificate: Certificate
  ): number {

    const width = pdf.internal.pageSize.getWidth();

    const x = 15;
    const y = 67;
    const w = width - 30;
    const h = 53;

    // Card background
    pdf.setFillColor(250, 250, 255);
    pdf.setDrawColor(...this.PDF_COLORS.purple);
    pdf.setLineWidth(0.45);

    pdf.roundedRect(
      x, y,
      w, h,
      2, 2,
      'FD'
    );

    // Card heading
    pdf.setFillColor(...this.PDF_COLORS.blue);

    pdf.roundedRect(
      x, y,
      w, 9,
      2, 2,
      'F'
    );

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);

    pdf.text(
      'STUDENT INFORMATION',
      x + 4,
      y + 6
    );

    // Student photo
    if (certificate.photo) {

      try {

        const imageType =
          certificate.photo.startsWith('data:image/png')
            ? 'PNG'
            : 'JPEG';

        pdf.addImage(
          certificate.photo,
          imageType,
          width - 43,
          y + 12,
          23,
          34
        );

        pdf.setDrawColor(...this.PDF_COLORS.gold);
        pdf.setLineWidth(0.7);

        pdf.rect(
          width - 43,
          y + 12,
          23,
          34
        );

      } catch (error) {

        console.warn('Student photo error:', error);
      }
    }

    // Student details
    const details: [string, string][] = [
      ['Registration No.', certificate.registrationNo],
      ['Student Name', certificate.studentName],
      ['Father / Mother', certificate.fatherName],
      ['Course', certificate.course],
      ['Duration', certificate.duration],
      ['Training Center', certificate.trainingCenter]
    ];

    let currentY = y + 15;

    details.forEach(([label, value]) => {

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.3);
      pdf.setTextColor(...this.PDF_COLORS.dark);

      pdf.text(label, 20, currentY);
      pdf.text(':', 58, currentY);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.3);
      pdf.setTextColor(65, 75, 90);

      const lines = pdf.splitTextToSize(
        value || '-',
        87
      );

      pdf.text(lines, 62, currentY);

      currentY += Math.max(
        5.4,
        lines.length * 3.5
      );
    });

    return y + h + 8;
  }

  // ==========================================
  // RESULT SUMMARY
  // ==========================================

  private drawResultSummary(
    pdf: jsPDF,
    y: number,
    percentage: number,
    grade: string,
    total: number,
    obtained: number
  ): number {

    const width = pdf.internal.pageSize.getWidth();

    const result = percentage >= 33 ? 'PASS' : 'FAIL';

    // Background
    pdf.setFillColor(248, 248, 253);
    pdf.setDrawColor(...this.PDF_COLORS.purple);
    pdf.setLineWidth(0.7);

    pdf.roundedRect(
      15, y,
      width - 30,
      28,
      2, 2,
      'FD'
    );

    // Percentage
    pdf.setFont('times', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...this.PDF_COLORS.purple);

    pdf.text(
      `PERCENTAGE: ${percentage.toFixed(2)}%`,
      21,
      y + 10
    );

    // Grade
    pdf.setFont('times', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...this.PDF_COLORS.blue);

    pdf.text(
      `GRADE: ${grade}`,
      width - 21,
      y + 10,
      { align: 'right' }
    );

    // Total marks
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...this.PDF_COLORS.dark);

    pdf.text(
      `TOTAL MARKS: ${obtained} / ${total}`,
      21,
      y + 21
    );

    // Result
    pdf.setTextColor(
      result === 'PASS' ? 0 : 190,
      result === 'PASS' ? 125 : 45,
      result === 'PASS' ? 71 : 45
    );

    pdf.text(
      `RESULT: ${result}`,
      width - 21,
      y + 21,
      { align: 'right' }
    );

    return y + 28;
  }

  // ==========================================
  // PDF FOOTER
  // ==========================================

  private drawPdfFooter(
    pdf: jsPDF,
    certificate: Certificate,
    qrCode: string,
    isoLogo: string
  ): void {

    const width = pdf.internal.pageSize.getWidth();

    // Session and issue date
    pdf.setTextColor(...this.PDF_COLORS.dark);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);

    pdf.text(
      `ACADEMIC SESSION: ${certificate.session}`,
      17,
      237
    );

    pdf.text(
      `ISSUE DATE: ${this.formatDate(certificate.issueDate)}`,
      width - 17,
      237,
      { align: 'right' }
    );

    // Signature lines
    pdf.setDrawColor(...this.PDF_COLORS.purple);
    pdf.setLineWidth(0.55);

    pdf.line(18, 247, 67, 247);
    pdf.line(width - 67, 247, width - 18, 247);

    pdf.setTextColor(...this.PDF_COLORS.dark);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(9);

    pdf.text(
      'Director',
      42.5,
      252,
      { align: 'center' }
    );

    pdf.text(
      'Controller of Examination',
      width - 42.5,
      252,
      { align: 'center' }
    );

    // Footer separator
    pdf.setDrawColor(...this.PDF_COLORS.gold);
    pdf.setLineWidth(0.8);

    pdf.line(
      15, 256,
      width - 15, 256
    );

    // ISO logo
    if (isoLogo) {

      try {

        pdf.addImage(
          isoLogo,
          isoLogo.startsWith('data:image/png')
            ? 'PNG'
            : 'JPEG',
          17, 260,
          25, 22
        );

      } catch (error) {

        console.warn('ISO logo error:', error);

        this.drawIsoFallback(pdf);
      }

    } else {

      this.drawIsoFallback(pdf);
    }

    // Institute footer
    pdf.setTextColor(...this.PDF_COLORS.purple);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(8);

    pdf.text(
      'CAREER GROUPS OF COMPUTER EDUCATION',
      width / 2,
      265,
      { align: 'center' }
    );

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(...this.PDF_COLORS.grey);

    pdf.text(
      'LEARN | BUILD | GROW',
      width / 2,
      271,
      { align: 'center' }
    );

    pdf.text(
      'www.careergroups.in',
      width / 2,
      277,
      { align: 'center' }
    );

    // QR code
    pdf.addImage(
      qrCode,
      'PNG',
      width - 41,
      259,
      24,
      24
    );

    pdf.setTextColor(...this.PDF_COLORS.blue);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.5);

    pdf.text(
      'SCAN TO VISIT WEBSITE',
      width - 29,
      285,
      { align: 'center' }
    );
  }

  // ==========================================
  // ISO FALLBACK
  // ==========================================

  private drawIsoFallback(pdf: jsPDF): void {

    pdf.setTextColor(...this.PDF_COLORS.purple);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);

    pdf.text(
      'ISO 9001:2015',
      17,
      269
    );

    pdf.setFontSize(6);

    pdf.text(
      'CERTIFIED COMPANY',
      17,
      275
    );
  }

  // ==========================================
  // ADVANCED PDF DOWNLOAD
  // ==========================================

  async downloadPdf(certificate: Certificate): Promise<void> {

    try {

      this.apiError = '';
      this.successMessage = '';

      if (!certificate) {
        throw new Error('Certificate data is missing.');
      }

      // A4 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const width = pdf.internal.pageSize.getWidth();

      // ======================================
      // LOAD INSTITUTE LOGO
      // ======================================

      let instituteLogo = '';
      let isoLogo = '';

      try {

        instituteLogo = await this.loadPdfImage(
          'assets/image/logo.jpeg'
        );

      } catch (error) {

        console.warn('Institute logo unavailable:', error);
      }

      try {

        isoLogo = await this.loadPdfImage(
          'assets/image/iso-logo.png'
        );

      } catch (error) {

        console.warn('ISO logo unavailable:', error);
      }

      // ======================================
      // GENERATE QR CODE
      // ======================================

      const qrCode = await QRCode.toDataURL(
        'https://careergroups.in',
        {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#172554',
            light: '#FFFFFF'
          }
        }
      );

      // ======================================
      // FIRST PAGE
      // ======================================

      this.drawPageDecoration(pdf);

      this.drawPdfHeader(
        pdf,
        certificate,
        instituteLogo
      );

      // ======================================
      // STUDENT INFORMATION
      // ======================================

      let y = this.drawStudentCard(
        pdf,
        certificate
      );

      // ======================================
      // COURSE MODULES
      // ======================================

      y = this.drawSectionHeading(
        pdf,
        'COURSE MODULES COVERED',
        y
      );

      const modules = (certificate.modules || []).filter(
        module => module && module.trim()
      );

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...this.PDF_COLORS.dark);

      modules.forEach((module, index) => {

        const lines = pdf.splitTextToSize(
          `${index + 1}. ${module}`,
          width - 43
        );

        const rowHeight = Math.max(
          6,
          lines.length * 4.2
        );

        if (y + rowHeight > 225) {

          pdf.addPage();

          this.drawPageDecoration(pdf);

          y = 23;
        }

        // Alternating row background
        if (index % 2 === 0) {

          pdf.setFillColor(248, 249, 254);

          pdf.roundedRect(
            17,
            y - 4,
            width - 34,
            rowHeight,
            1, 1,
            'F'
          );
        }

        pdf.setFillColor(...this.PDF_COLORS.gold);

        pdf.circle(
          21,
          y - 1,
          0.9,
          'F'
        );

        pdf.setTextColor(...this.PDF_COLORS.dark);

        pdf.text(
          lines,
          25,
          y
        );

        y += rowHeight + 1;
      });

      // ======================================
      // EXAMINATION HEADING
      // ======================================

      y += 4;

      if (y + 20 > 225) {

        pdf.addPage();

        this.drawPageDecoration(pdf);

        y = 23;
      }

      y = this.drawSectionHeading(
        pdf,
        'EXAMINATION PERFORMANCE',
        y
      );

      // ======================================
      // MARKS CALCULATION
      // ======================================

      const total = this.calculateTotal(
        certificate.exams || [],
        'fullMarks'
      );

      const obtained = this.calculateTotal(
        certificate.exams || [],
        'obtained'
      );

      const percentage = total > 0
        ? (obtained / total) * 100
        : 0;

      const grade = this.getGrade(percentage);

      // ======================================
      // EXAMINATION TABLE
      // ======================================

      autoTable(pdf, {

        startY: y,

        margin: {
          left: 15,
          right: 15,
          top: 18,
          bottom: 68
        },

        head: [[
          'S.NO.',
          'SUBJECT / EXAMINATION',
          'FULL MARKS',
          'OBTAINED'
        ]],

        body: (certificate.exams || []).map(
          (exam, index) => [
            String(index + 1).padStart(2, '0'),
            exam.name,
            String(exam.fullMarks),
            String(exam.obtained)
          ]
        ),

        foot: [[
          '',
          'TOTAL MARKS',
          String(total),
          String(obtained)
        ]],

        showFoot: 'lastPage',

        theme: 'grid',

        // Solid table cell background
        styles: {
          font: 'helvetica',
          fontStyle: 'normal',
          fontSize: 9,

          cellPadding: {
            top: 4,
            right: 3,
            bottom: 4,
            left: 3
          },

          textColor: [35, 42, 65],
          fillColor: [255, 255, 255],

          lineColor: [190, 195, 215],
          lineWidth: 0.35,

          valign: 'middle',
          halign: 'center',
          overflow: 'linebreak',

          minCellHeight: 10
        },

        // Purple heading
        headStyles: {
          fillColor: [83, 58, 165],
          textColor: [255, 255, 255],

          font: 'helvetica',
          fontStyle: 'bold',
          fontSize: 9,

          halign: 'center',
          valign: 'middle',

          cellPadding: 4.5,

          lineColor: [190, 145, 55],
          lineWidth: 0.5
        },

        // White body rows
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [35, 42, 65],
          minCellHeight: 10
        },

        // Alternate rows
        alternateRowStyles: {
          fillColor: [241, 243, 251]
        },

        // Blue total row
        footStyles: {
          fillColor: [0, 103, 244],
          textColor: [255, 255, 255],

          fontStyle: 'bold',
          fontSize: 9,

          cellPadding: 4.5,

          lineColor: [190, 145, 55],
          lineWidth: 0.5
        },

        columnStyles: {
          0: {
            cellWidth: 18,
            halign: 'center',
            fontStyle: 'bold'
          },

          1: {
            cellWidth: 'auto',
            halign: 'left',
            fontStyle: 'normal'
          },

          2: {
            cellWidth: 34,
            halign: 'center'
          },

          3: {
            cellWidth: 34,
            halign: 'center',
            fontStyle: 'bold'
          }
        },

        // Draw border on all generated pages
        willDrawPage: () => {
          this.drawPageDecoration(pdf);
        }
      });

      // ======================================
      // FINAL RESULT
      // ======================================

      let finalY =
        (pdf as any).lastAutoTable?.finalY || y + 30;

      finalY += 7;

      // New page only when required
      if (finalY + 43 > 225) {

        pdf.addPage();

        this.drawPageDecoration(pdf);

        finalY = 22;
      }

      this.drawSectionHeading(
        pdf,
        'FINAL RESULT',
        finalY
      );

      this.drawResultSummary(
        pdf,
        finalY + 14,
        percentage,
        grade,
        total,
        obtained
      );

      // ======================================
      // FOOTER ON LAST PAGE
      // ======================================

      pdf.setPage(pdf.getNumberOfPages());

      this.drawPdfFooter(
        pdf,
        certificate,
        qrCode,
        isoLogo
      );

      // ======================================
      // DOWNLOAD PDF
      // ======================================

      const safeSerial = (
        certificate.serialNo || 'Result'
      ).replace(/[^a-zA-Z0-9_-]/g, '_');

      pdf.save(
        `CGCE_Certificate_${safeSerial}.pdf`
      );

      this.successMessage =
        'Professional certificate PDF downloaded successfully.';

    } catch (error) {

      console.error(
        'ADVANCED PDF GENERATION ERROR:',
        error
      );

      this.apiError =
        'Unable to generate PDF. Please check image assets and installed packages.';
    }
  }
}
