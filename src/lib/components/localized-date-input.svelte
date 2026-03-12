<script lang="ts">
  import DateInput from './ui/input/date/input.svelte'
  import type { Props as DateInputProps } from './ui/input/date/input.svelte'
  import { _ } from 'svelte-i18n'

  type Props = Omit<DateInputProps, 'yearLabel' | 'monthLabel' | 'dayLabel' | 'errorMessages'>

  let { value = $bindable(), ...restProps }: Props = $props()
</script>

<DateInput
  {...restProps}
  bind:value
  yearLabel={$_('common.year')}
  monthLabel={$_('common.month')}
  dayLabel={$_('common.day')}
  errorMessages={{
    invalidYear: $_('error.invalidYear'),
    invalidMonth: $_('error.invalidMonth'),
    invalidDay: $_('error.invalidDay'),
    invalidDate: $_('error.invalidDate'),
  }}
/>
