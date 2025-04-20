import React from 'react'
import { Button } from '@/components/ui/button'
import { ChartComponent } from '@/components/local/chart'

export default function Home() {
  return (
    <>
        <h1>Hello World</h1>
        <Button className='button'>Touch me</Button>
        <ChartComponent />
    </>
  );
}
