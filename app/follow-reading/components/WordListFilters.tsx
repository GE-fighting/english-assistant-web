'use client'

import { useState, useEffect } from 'react'
import { textbookApi } from '@/api/textbook'
import { Select } from '@/components/ui/select'
import { ApiResponse } from '@/types/response'
import { Version, Grade, Semester, Unit } from '@/types/textbook'

interface WordListFiltersProps {
  onUnitChange?: (unitId: number) => void;
}

export default function WordListFilters({ onUnitChange }: WordListFiltersProps) {
  // 版本状态
  const [versions, setVersions] = useState<ApiResponse<Version[]>| null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  
  // 年级状态
  const [grades, setGrades] = useState<ApiResponse<Grade[]>| null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  
  // 学期状态
  const [semesters, setSemesters] = useState<ApiResponse<Semester[]> | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<string>('')

  // 单元状态
  const [units, setUnits] = useState<ApiResponse<Unit[]> | null>(null)
  
  // 加载状态
  const [loading, setLoading] = useState({
    versions: true,
    grades: true,
    semesters: true,
    units: false
  })

  const fetchVersions = async () => {
    console.log('🔍 Fetching versions...')
    try {
      const data = await textbookApi.getVersions()
      console.log('✅ Versions API response:', data)
      setVersions(data)
    } catch (error) {
      console.error('❌ Error in fetchVersions:', error)
    } finally {
      setLoading(prev => ({ ...prev, versions: false }))
    }
  }

  const fetchGrades = async () => {
    console.log('🔍 Fetching grades...')
    try {
      const data = await textbookApi.getGrades()
      console.log('✅ Grades API response:', data)
      setGrades(data)
    } catch (error) {
      console.error('❌ Error in fetchGrades:', error)
    } finally {
      setLoading(prev => ({ ...prev, grades: false }))
    }
  }

  const fetchSemesters = async () => {
    console.log('🔍 Fetching semesters...')
    try {
      const data = await textbookApi.getSemesters()
      console.log('✅ Semesters API response:', data)
      setSemesters(data)
    } catch (error) {
      console.error('❌ Error in fetchSemesters:', error)
    } finally {
      setLoading(prev => ({ ...prev, semesters: false }))
    }
  }

  const fetchUnits = async () => {
    // 只有当所有必要的值都选择后才获取单元列表
    if (!selectedVersion || !selectedGrade || !selectedSemester) {
      setUnits(null)
      return
    }

    console.log('🔍 Fetching units...')
    setLoading(prev => ({ ...prev, units: true }))
    
    try {
      const data = await textbookApi.getUnits(
        Number(selectedVersion),
        Number(selectedGrade),
        Number(selectedSemester)
      )
      console.log('✅ Units API response:', data)
      setUnits(data)
    } catch (error) {
      console.error('❌ Error in fetchUnits:', error)
      setUnits(null)
    } finally {
      setLoading(prev => ({ ...prev, units: false }))
    }
  }

  useEffect(() => {
    fetchVersions()
    fetchGrades()
    fetchSemesters()
    
  }, [])

  // 当任何依赖的选择发生变化时，重新获取单元列表
  useEffect(() => {
    fetchUnits()
  }, [selectedVersion, selectedGrade, selectedSemester])

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVersion(e.target.value)
    setSelectedGrade('')
    setSelectedSemester('')
    setUnits(null)
  }

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value)
    setSelectedSemester('')
    setUnits(null)
  }

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemester(e.target.value)
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = Number(e.target.value);
    if (unitId && onUnitChange) {
      onUnitChange(unitId);
    }
  };

  return (
    <div className="flex gap-4">
      <Select
        value={selectedVersion}
        options={versions?.data?.map(v => ({ value: v.id.toString(), label: v.name })) || []}
        placeholder="选择版本"
        loading={loading.versions}
        className="w-[160px]"
        onChange={handleVersionChange}
      />
      <Select
        value={selectedGrade}
        options={grades?.data?.map(g => ({ value: g.id.toString(), label: g.name })) || []}
        placeholder="选择年级"
        loading={loading.grades}
        className="w-[160px]"
        onChange={handleGradeChange}
        disabled={!selectedVersion}
      />
      <Select
        value={selectedSemester}
        options={semesters?.data?.map(s => ({ value: s.id.toString(), label: s.name })) || []}
        placeholder="选择学期"
        loading={loading.semesters}
        className="w-[160px]"
        onChange={handleSemesterChange}
        disabled={!selectedGrade}
      />
      <Select
        value=""
        options={units?.data?.map(u => ({ value: u.id.toString(), label: u.name })) || []}
        placeholder="选择单元"
        loading={loading.units}
        className="w-[160px]"
        disabled={!selectedSemester}
        onChange={handleUnitChange}
      />
    </div>
  )
}