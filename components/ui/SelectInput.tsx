import { cn } from '@/lib/utils'

const SelectInput = ({ options, isEmpty, firstItem }: { options: string[], isEmpty: boolean, firstItem?: string }) => {
  return (
    <select 
    className={
        cn('w-full outline-none text-[#D5D9DE] pointer-events-none', 
        !isEmpty && 'pointer-events-auto text-[#212121]')}
    >
        {firstItem && <option value={''}>{firstItem}</option>}
        {
            options.map(item => (
                <option key={item} value={item}>{item}</option>
            ))
        }
    </select>
  )

}

export default SelectInput
