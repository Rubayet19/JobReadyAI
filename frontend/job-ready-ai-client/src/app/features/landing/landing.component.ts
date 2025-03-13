import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  features = [
    {
      title: 'Smart Question Generation',
      description: 'Analyzes job descriptions to create relevant interview questions tailored to your needs.',
      icon: '🧠'
    },
    {
      title: 'Multiple Question Categories',
      description: 'Technical, behavioral, and situational questions for comprehensive preparation.',
      icon: '📋'
    },
    {
      title: 'Interactive Chat Interface',
      description: 'Clean and responsive design that makes preparing for interviews effortless.',
      icon: '💬'
    },
    {
      title: 'Export Functionality',
      description: 'Save your interview questions in PDF or text format for offline review.',
      icon: '💾'
    },
    {
      title: 'Conversation History',
      description: 'Maintains context for follow-up questions to enhance the interview simulation.',
      icon: '📚'
    },
    {
      title: 'Real-time Responses',
      description: 'Immediate AI-generated feedback to practice your interview skills effectively.',
      icon: '⚡'
    }
  ];
}
