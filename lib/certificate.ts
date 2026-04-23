import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatDate } from "./utils";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 60,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 40,
  },
  brand: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#6366f1",
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  divider: {
    height: 2,
    backgroundColor: "#6366f1",
    marginVertical: 24,
  },
  body: {
    textAlign: "center",
    flex: 1,
    justifyContent: "center",
  },
  certTitle: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 24,
  },
  presented: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  studentName: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: "#6366f1",
    marginBottom: 24,
    borderBottom: "1 solid #6366f1",
    paddingBottom: 8,
  },
  completion: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 24,
  },
  date: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  footer: {
    textAlign: "center",
    marginTop: 40,
  },
  certId: {
    fontSize: 10,
    color: "#9ca3af",
    letterSpacing: 1,
  },
  seal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366f1",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  sealText: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
});

function CertificateDocument({
  studentName,
  courseName,
  completionDate,
  certificateId,
}: {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
}) {
  return createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", orientation: "landscape", style: styles.page },
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: styles.brand }, "PICKWISE"),
        createElement(Text, { style: styles.subtitle }, "Learning Platform")
      ),
      createElement(View, { style: styles.divider }),
      createElement(
        View,
        { style: styles.body },
        createElement(Text, { style: styles.certTitle }, "Certificate of Completion"),
        createElement(Text, { style: styles.presented }, "This is to certify that"),
        createElement(Text, { style: styles.studentName }, studentName),
        createElement(Text, { style: styles.completion }, "has successfully completed the course"),
        createElement(Text, { style: styles.courseName }, courseName),
        createElement(Text, { style: styles.date }, `Completed on: ${completionDate}`)
      ),
      createElement(View, { style: styles.divider }),
      createElement(
        View,
        { style: styles.footer },
        createElement(Text, { style: styles.certId }, `Certificate ID: ${certificateId}`)
      )
    )
  );
}

export async function generateCertificate({
  studentName,
  courseName,
  completionDate,
  certificateId,
}: {
  studentName: string;
  courseName: string;
  completionDate: Date;
  certificateId: string;
}): Promise<Buffer> {
  const doc = createElement(CertificateDocument, {
    studentName,
    courseName,
    completionDate: formatDate(completionDate),
    certificateId,
  });

  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}
