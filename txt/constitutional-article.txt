// types/models/platform/constitutional-article.ts
import React from 'react';

export interface ConstitutionalArticle {
    id: number;
    romanNumeral: string;
    title: string;
    content: React.ReactNode; 
    iconName: string;
}