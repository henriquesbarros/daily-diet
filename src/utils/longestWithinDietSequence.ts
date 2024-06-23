import { Meal } from '../@types/meal'

export const longestWithinDietSequence = (meals: Meal[]) => {
  let maxSequence = 0
  let currentSequence = 0

  for (const meal of meals) {
    if (meal.is_within_diet === 1) {
      currentSequence++
      if (currentSequence > maxSequence) {
        maxSequence = currentSequence
      }
    } else {
      currentSequence = 0
    }
  }

  return maxSequence
}
