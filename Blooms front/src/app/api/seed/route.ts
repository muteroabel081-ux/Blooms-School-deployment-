import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    // Check if database is already populated
    const existingParents = await db.parent.count()
    const existingStudents = await db.student.count()

    // If database already contains data and force is not specified, PRESERVE ALL DATA!
    if (!force && existingParents > 0 && existingStudents > 0) {
      return NextResponse.json({
        message: 'Database already initialized. Preserving all existing user data and media.',
        alreadySeeded: true,
      }, { status: 200 })
    }

    // Only clear existing data if database is empty or if explicitly forced
    await db.schoolWorkView.deleteMany()
    await db.schoolWork.deleteMany()
    await db.receipt.deleteMany()
    await db.feePayment.deleteMany()
    await db.application.deleteMany()
    await db.schemeOfWork.deleteMany()
    await db.employmentContract.deleteMany()
    await db.teacherConduct.deleteMany()
    await db.payslip.deleteMany()
    await db.fee.deleteMany()
    await db.notification.deleteMany()
    await db.message.deleteMany()
    await db.mediaItem.deleteMany()
    await db.announcement.deleteMany()
    await db.tripEvent.deleteMany()
    await db.student.deleteMany()
    await db.teacher.deleteMany()
    await db.parent.deleteMany()

    // Create 5 parents with star ratings
    const parent1 = await db.parent.create({
      data: {
        name: 'James Kamau',
        email: 'james.kamau@email.com',
        phone: '+254712345001',
        occupation: 'Businessman',
        address: '123 Westlands Road, Nairobi',
        starRating: 8,
        starTier: 'Gold',
        participation: 'Active PTA member, Volunteer at Sports Day',
      },
    })
    const parent2 = await db.parent.create({
      data: {
        name: 'Rose Wanjiku',
        email: 'rose.wanjiku@email.com',
        phone: '+254712345002',
        occupation: 'Teacher',
        address: '456 Kilimani Drive, Nairobi',
        starRating: 5,
        starTier: 'Silver',
        participation: 'Contributed to Science Fair materials',
      },
    })
    const parent3 = await db.parent.create({
      data: {
        name: 'Otieno Odhiambo',
        email: 'otieno.o@email.com',
        phone: '+254712345003',
        occupation: 'Engineer',
        address: '789 Kisumu Road, Kisumu',
        starRating: 12,
        starTier: 'Platinum',
        participation: 'Sponsored library books, Mentoring program',
      },
    })
    const parent4 = await db.parent.create({
      data: {
        name: 'Achieng Obonyo',
        email: 'achieng.o@email.com',
        phone: '+254712345004',
        occupation: 'Nurse',
        address: '321 Mombasa Road, Mombasa',
        starRating: 3,
        starTier: 'Bronze',
        participation: '',
      },
    })
    const parent5 = await db.parent.create({
      data: {
        name: 'Mwangi Ndiritu',
        email: 'mwangi.n@email.com',
        phone: '+254712345005',
        occupation: 'Accountant',
        address: '654 Thika Road, Nairobi',
        starRating: 13,
        starTier: 'Diamond',
        participation: 'Board member, Annual gala organizer',
      },
    })

    // Create 5 students (each linked to a parent)
    const student1 = await db.student.create({
      data: {
        firstName: 'John',
        lastName: 'Kamau',
        admissionNo: 'ADM/001',
        grade: 'Grade 1',
        gender: 'Male',
        dateOfBirth: '2018-03-15',
        parentPhone: parent1.phone,
        parentEmail: parent1.email,
        address: parent1.address,
        parentId: parent1.id,
        nemisNumber: 'NEM/2024/001',
        hobbies: 'Football, Drawing',
        allergens: 'Peanuts',
      },
    })
    const student2 = await db.student.create({
      data: {
        firstName: 'Mary',
        lastName: 'Wanjiku',
        admissionNo: 'ADM/002',
        grade: 'Grade 2',
        gender: 'Female',
        dateOfBirth: '2017-07-22',
        parentPhone: parent2.phone,
        parentEmail: parent2.email,
        address: parent2.address,
        parentId: parent2.id,
        nemisNumber: 'NEM/2024/002',
        hobbies: 'Netball, Reading',
      },
    })
    const student3 = await db.student.create({
      data: {
        firstName: 'Peter',
        lastName: 'Otieno',
        admissionNo: 'ADM/003',
        grade: 'Grade 3',
        gender: 'Male',
        dateOfBirth: '2016-11-08',
        parentPhone: parent3.phone,
        parentEmail: parent3.email,
        address: parent3.address,
        parentId: parent3.id,
        nemisNumber: 'NEM/2024/003',
        hobbies: 'Swimming, Chess',
        allergens: 'Dust',
      },
    })
    const student4 = await db.student.create({
      data: {
        firstName: 'Grace',
        lastName: 'Achieng',
        admissionNo: 'ADM/004',
        grade: 'Grade 1',
        gender: 'Female',
        dateOfBirth: '2018-09-30',
        parentPhone: parent4.phone,
        parentEmail: parent4.email,
        address: parent4.address,
        parentId: parent4.id,
        nemisNumber: 'NEM/2024/004',
        hobbies: 'Music, Art',
      },
    })
    const student5 = await db.student.create({
      data: {
        firstName: 'Samuel',
        lastName: 'Mwangi',
        admissionNo: 'ADM/005',
        grade: 'Grade 2',
        gender: 'Male',
        dateOfBirth: '2017-01-12',
        parentPhone: parent5.phone,
        parentEmail: parent5.email,
        address: parent5.address,
        parentId: parent5.id,
        nemisNumber: 'NEM/2024/005',
        hobbies: 'Cricket, Science Club',
        allergens: 'None',
      },
    })

    // Create 3 teachers
    const teacher1 = await db.teacher.create({
      data: {
        firstName: 'Jane',
        lastName: 'Njeri',
        email: 'jane.njeri@blooms.ac.ke',
        phone: '+254722001001',
        subject: 'Mathematics',
        qualification: 'B.Ed Mathematics',
        status: 'Active',
      },
    })
    const teacher2 = await db.teacher.create({
      data: {
        firstName: 'Paul',
        lastName: 'Ochieng',
        email: 'paul.ochieng@blooms.ac.ke',
        phone: '+254722001002',
        subject: 'English',
        qualification: 'B.A English Literature',
        status: 'Active',
      },
    })
    const teacher3 = await db.teacher.create({
      data: {
        firstName: 'Alice',
        lastName: 'Muthoni',
        email: 'alice.muthoni@blooms.ac.ke',
        phone: '+254722001003',
        subject: 'Science',
        qualification: 'B.Sc Education',
        status: 'Pending',
      },
    })

    // Create payslips for teachers
    await db.payslip.createMany({
      data: [
        {
          teacherId: teacher1.id,
          month: 'January',
          year: '2025',
          basicSalary: 50000,
          allowances: 10000,
          deductions: 8000,
          netPay: 52000,
        },
        {
          teacherId: teacher1.id,
          month: 'February',
          year: '2025',
          basicSalary: 50000,
          allowances: 10000,
          deductions: 8000,
          netPay: 52000,
        },
        {
          teacherId: teacher2.id,
          month: 'January',
          year: '2025',
          basicSalary: 45000,
          allowances: 8000,
          deductions: 7000,
          netPay: 46000,
        },
        {
          teacherId: teacher2.id,
          month: 'February',
          year: '2025',
          basicSalary: 45000,
          allowances: 8000,
          deductions: 7000,
          netPay: 46000,
        },
      ],
    })

    // Create conduct records
    await db.teacherConduct.createMany({
      data: [
        {
          teacherId: teacher1.id,
          rating: 'Excellent',
          comments: 'Outstanding classroom management and innovative teaching methods. Students show significant improvement in mathematics scores.',
          loggedBy: 'System Administrator',
          period: 'Term 1 2025',
        },
        {
          teacherId: teacher2.id,
          rating: 'Good',
          comments: 'Consistent lesson delivery and good student engagement. Recommended to incorporate more interactive activities.',
          loggedBy: 'System Administrator',
          period: 'Term 1 2025',
        },
        {
          teacherId: teacher1.id,
          rating: 'Good',
          comments: 'Maintained strong performance. Successfully organized the Mathematics Olympiad.',
          loggedBy: 'Head Teacher',
          period: 'Term 3 2024',
        },
      ],
    })

    // Create employment contracts
    await db.employmentContract.createMany({
      data: [
        {
          teacherId: teacher1.id,
          contractNo: 'BJS/EMP/2024/001',
          startDate: '2024-01-15',
          endDate: '2026-01-14',
          salary: 60000,
          position: 'Senior Mathematics Teacher',
          status: 'Active',
        },
        {
          teacherId: teacher2.id,
          contractNo: 'BJS/EMP/2024/002',
          startDate: '2024-02-01',
          endDate: '2026-01-31',
          salary: 54000,
          position: 'English Teacher',
          status: 'Active',
        },
      ],
    })

    // Create schemes of work
    await db.schemeOfWork.createMany({
      data: [
        {
          teacherId: teacher1.id,
          title: 'Mathematics Term 1 Scheme',
          subject: 'Mathematics',
          grade: 'Grade 3',
          term: 'Term 1 2025',
          fileUrl: '/uploads/math-scheme-t1.pdf',
        },
        {
          teacherId: teacher2.id,
          title: 'English Term 1 Scheme',
          subject: 'English',
          grade: 'Grade 2',
          term: 'Term 1 2025',
          fileUrl: '/uploads/english-scheme-t1.pdf',
        },
        {
          teacherId: teacher1.id,
          title: 'Mathematics Term 3 Scheme',
          subject: 'Mathematics',
          grade: 'Grade 1',
          term: 'Term 3 2024',
          fileUrl: '/uploads/math-scheme-t3.pdf',
        },
      ],
    })

    // Create fee records for Term 1 2025 (saved as variables for referencing in payments)
    const fee1 = await db.fee.create({
      data: {
        studentId: student1.id,
        term: 'Term 1 2025',
        amount: 25000,
        paid: 25000,
        status: 'Paid',
        dueDate: '2025-02-28',
        paidDate: '2025-02-15',
      },
    })
    const fee2 = await db.fee.create({
      data: {
        studentId: student2.id,
        term: 'Term 1 2025',
        amount: 25000,
        paid: 25000,
        status: 'Paid',
        dueDate: '2025-02-28',
        paidDate: '2025-03-01',
      },
    })
    const fee3 = await db.fee.create({
      data: {
        studentId: student3.id,
        term: 'Term 1 2025',
        amount: 25000,
        paid: 25000,
        status: 'Paid',
        dueDate: '2025-02-28',
        paidDate: '2025-02-20',
      },
    })
    const fee4 = await db.fee.create({
      data: {
        studentId: student4.id,
        term: 'Term 1 2025',
        amount: 25000,
        paid: 16000,
        status: 'Pending',
        dueDate: '2025-02-28',
      },
    })
    await db.fee.createMany({
      data: [
        {
          studentId: student5.id,
          term: 'Term 1 2025',
          amount: 25000,
          paid: 0,
          status: 'Overdue',
          dueDate: '2025-02-28',
        },
        {
          studentId: student4.id,
          term: 'Term 1 2025 - Activity Fee',
          amount: 12000,
          paid: 0,
          status: 'Pending',
          dueDate: '2025-03-31',
        },
      ],
    })

    // Create fee payments (4 verified + 1 pending)
    const payment1 = await db.feePayment.create({
      data: {
        studentId: student1.id,
        studentName: 'John Kamau',
        feeId: fee1.id,
        amount: 25000,
        paymentMethod: 'M-Pesa',
        referenceNo: 'MPESA/2025/001',
        term: 'Term 1 2025',
        status: 'Verified',
        verifiedBy: 'System Administrator',
        verifiedAt: new Date('2025-02-15'),
      },
    })
    const payment2 = await db.feePayment.create({
      data: {
        studentId: student2.id,
        studentName: 'Mary Wanjiku',
        feeId: fee2.id,
        amount: 25000,
        paymentMethod: 'Bank Slip',
        referenceNo: 'BANK/2025/001',
        term: 'Term 1 2025',
        status: 'Verified',
        verifiedBy: 'System Administrator',
        verifiedAt: new Date('2025-03-01'),
      },
    })
    const payment3 = await db.feePayment.create({
      data: {
        studentId: student3.id,
        studentName: 'Peter Otieno',
        feeId: fee3.id,
        amount: 25000,
        paymentMethod: 'M-Pesa',
        referenceNo: 'MPESA/2025/002',
        term: 'Term 1 2025',
        status: 'Verified',
        verifiedBy: 'System Administrator',
        verifiedAt: new Date('2025-02-20'),
      },
    })
    const payment4 = await db.feePayment.create({
      data: {
        studentId: student4.id,
        studentName: 'Grace Achieng',
        feeId: fee4.id,
        amount: 16000,
        paymentMethod: 'M-Pesa',
        referenceNo: 'MPESA/2025/003',
        term: 'Term 1 2025',
        status: 'Verified',
        verifiedBy: 'System Administrator',
        verifiedAt: new Date('2025-03-10'),
      },
    })
    await db.feePayment.create({
      data: {
        studentId: student4.id,
        studentName: 'Grace Achieng',
        feeId: fee4.id,
        amount: 5000,
        paymentMethod: 'M-Pesa',
        referenceNo: 'MPESA/2025/004',
        term: 'Term 1 2025',
        status: 'Pending Verification',
      },
    })

    // Create receipts for verified payments
    await db.receipt.createMany({
      data: [
        {
          paymentId: payment1.id,
          studentId: student1.id,
          studentName: 'John Kamau',
          amount: 25000,
          paymentMethod: 'M-Pesa',
          referenceNo: 'MPESA/2025/001',
          term: 'Term 1 2025',
          receiptNo: 'RCP/0001',
          verifiedBy: 'System Administrator',
        },
        {
          paymentId: payment2.id,
          studentId: student2.id,
          studentName: 'Mary Wanjiku',
          amount: 25000,
          paymentMethod: 'Bank Slip',
          referenceNo: 'BANK/2025/001',
          term: 'Term 1 2025',
          receiptNo: 'RCP/0002',
          verifiedBy: 'System Administrator',
        },
        {
          paymentId: payment3.id,
          studentId: student3.id,
          studentName: 'Peter Otieno',
          amount: 25000,
          paymentMethod: 'M-Pesa',
          referenceNo: 'MPESA/2025/002',
          term: 'Term 1 2025',
          receiptNo: 'RCP/0003',
          verifiedBy: 'System Administrator',
        },
        {
          paymentId: payment4.id,
          studentId: student4.id,
          studentName: 'Grace Achieng',
          amount: 16000,
          paymentMethod: 'M-Pesa',
          referenceNo: 'MPESA/2025/003',
          term: 'Term 1 2025',
          receiptNo: 'RCP/0004',
          verifiedBy: 'System Administrator',
        },
      ],
    })

    // Create school work (homework assignments)
    await db.schoolWork.createMany({
      data: [
        {
          teacherId: teacher1.id,
          title: 'Addition & Subtraction Practice',
          description: 'Complete exercises 1-20 on page 45 of the mathematics textbook. Show all working.',
          subject: 'Mathematics',
          grade: 'Grade 3',
          type: 'Homework',
          fileUrl: '/uploads/math-hw1.pdf',
        },
        {
          teacherId: teacher2.id,
          title: 'Reading Comprehension: The Little Red Hen',
          description: 'Read the story and answer questions 1-8. Write answers in full sentences.',
          subject: 'English',
          grade: 'Grade 2',
          type: 'Homework',
          fileUrl: '/uploads/eng-hw1.pdf',
        },
        {
          teacherId: teacher1.id,
          title: 'Multiplication Tables Quiz',
          description: 'Learn multiplication tables from 2 to 5. There will be a quiz next Monday.',
          subject: 'Mathematics',
          grade: 'Grade 1',
          type: 'Assignment',
          fileUrl: '/uploads/math-quiz1.pdf',
        },
      ],
    })

    // Create announcements
    await db.announcement.createMany({
      data: [
        {
          title: 'Science Project Success',
          content: 'Great job everyone on the science project! The presentations were outstanding.',
          author: 'Mrs. Jane Njeri',
        },
        {
          title: 'Term 1 Exams Schedule',
          content: 'Term 1 examinations will begin on 25th March 2025.',
          author: 'Mr. Paul Ochieng',
        },
        {
          title: 'Parent-Teacher Meeting',
          content: 'Meeting scheduled for 15th April 2025 at 2:00 PM.',
          author: 'System Administrator',
        },
      ],
    })

    // Create trips/events
    await db.tripEvent.createMany({
      data: [
        {
          title: 'Nairobi National Park Educational Trip',
          description: 'An exciting educational trip to Nairobi National Park. Students will learn about wildlife conservation and biodiversity.',
          date: '2025-04-10',
          location: 'Nairobi National Park',
          status: 'Upcoming',
          images: '[]',
        },
        {
          title: 'Sports Day 2025',
          description: 'Annual sports day featuring athletics, football, and various team sports. Parents are welcome to attend.',
          date: '2025-05-15',
          location: 'BLOOMS Junior School Sports Ground',
          status: 'Upcoming',
          images: '[]',
        },
      ],
    })

    // Create notifications
    await db.notification.createMany({
      data: [
        {
          title: 'Fee Reminder',
          message: 'Term 1 fees are due by 28th February 2025. Please ensure timely payment.',
          type: 'warning',
          read: false,
        },
        {
          title: 'New Teacher Application',
          message: 'Alice Muthoni has applied for the Science teacher position. Please review the application.',
          type: 'info',
          read: false,
        },
        {
          title: 'System Update',
          message: 'The school management system has been updated with new features.',
          type: 'success',
          read: true,
        },
      ],
    })

    // Create messages with senderRole
    await db.message.createMany({
      data: [
        {
          sender: 'James Kamau',
          senderRole: 'parent',
          subject: 'Fee Payment Inquiry',
          content: "Hello, I would like to inquire about the payment plan options for Term 1 fees. Could you please provide more details on the available installment plans?",
          read: false,
        },
        {
          sender: 'Rose Wanjiku',
          senderRole: 'parent',
          subject: 'Report Card Request',
          content: "Good morning. I would like to request Mary's Term 4 report card from last year. Could you please email it to me or let me know when I can pick it up from the school office?",
          read: true,
        },
        {
          sender: 'System Administrator',
          senderRole: 'admin',
          subject: 'Welcome to BLOOMS School Portal',
          content: "Dear Parents and Staff, welcome to the new BLOOMS Junior School Management Portal. Here you can view your child's academic progress, communicate with teachers, and stay updated on school events. Please do not hesitate to reach out if you have any questions!",
          read: false,
        },
        {
          sender: 'Jane Njeri',
          senderRole: 'teacher',
          subject: 'Mathematics Olympiad Results',
          content: "Dear Parents, I am pleased to announce that our students performed exceptionally well in the inter-school Mathematics Olympiad. Three of our students secured top 10 positions! Detailed results will be shared during the upcoming parent-teacher meeting.",
          read: false,
        },
        {
          sender: 'Otieno Odhiambo',
          senderRole: 'parent',
          subject: 'Library Book Donation',
          content: "Hello Admin, I would like to donate a set of 50 science reference books to the school library. Please let me know when would be a convenient time to deliver them. Looking forward to supporting our children's education.",
          read: true,
        },
      ],
    })

    // Create media items
    await db.mediaItem.createMany({
      data: [
        {
          title: 'School Assembly',
          category: 'General',
          imageUrl: 'https://placehold.co/600x400/1e293b/f59e0b?text=School+Activity+1',
        },
        {
          title: 'Classroom Learning',
          category: 'Academics',
          imageUrl: 'https://placehold.co/600x400/1e293b/22c55e?text=School+Activity+2',
        },
        {
          title: 'Sports Practice',
          category: 'Sports',
          imageUrl: 'https://placehold.co/600x400/1e293b/ef4444?text=School+Activity+3',
        },
      ],
    })

    // Create additional application
    await db.application.create({
      data: {
        applicantName: 'Faith Wambui',
        email: 'faith.wambui@email.com',
        phone: '+254733001004',
        position: 'Swahili Teacher',
        whyMe: 'I have 5 years of experience teaching Swahili in primary schools with excellent KCPE results.',
        whyBlooms: 'BLOOMS has a reputation for nurturing talent and I want to be part of that culture.',
        status: 'Under Review',
      },
    })

    return NextResponse.json(
      {
        message: 'Database seeded successfully',
        stats: {
          students: 5,
          parents: 5,
          teachers: 3,
          payslips: 4,
          conducts: 3,
          contracts: 2,
          schemes: 3,
          fees: 6,
          payments: 5,
          receipts: 4,
          schoolWork: 3,
          announcements: 3,
          tripsEvents: 2,
          notifications: 3,
          messages: 5,
          mediaItems: 3,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
